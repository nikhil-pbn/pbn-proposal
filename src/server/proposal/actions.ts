"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, ProposalStatus } from "@/server/db";
import { ProposalExtractionError } from "@/server/claude/extract-proposal";
import { generateExtraction } from "./generate";
import { assembleProposal } from "./assemble-proposal";
import { buildUniqueSlug } from "./slug";
import {
  confirmTracking,
  proposalUrlFor,
  recordGeneration,
} from "@/server/tracking/record";
import {
  getFieldErrors,
  transcriptInputSchema,
  type TranscriptInputErrors,
} from "@/server/validation/transcript-input";
import { proposalContentSchema, type ProposalContent } from "@/types/proposal";

/** Returned only on failure — success redirects and never returns. */
export type GenerateResult = {
  ok: false;
  message: string;
  fieldErrors?: TranscriptInputErrors;
};

export type MutationResult = { ok: true } | { ok: false; message: string };

function formatPreparedOn(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Steps 1–6 of the spec: validate the form, send the transcript to Claude,
 * assemble the proposal, save it, log the generation, then redirect to the
 * editor.
 */
export async function generateProposal(input: {
  repName: string;
  repEmail: string;
  transcript: string;
}): Promise<GenerateResult> {
  // Never trust the client, even though the form validates with the same schema.
  const parsed = transcriptInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }
  const { repName, repEmail, transcript } = parsed.data;

  let proposalId: string;
  // Carried into the redirect so the editor can announce what actually ran —
  // otherwise a silent Claude-to-offline fallback is invisible to the rep.
  let engineUsed: "claude" | "offline" = "offline";
  let fallbackReason: string | undefined;

  try {
    // Claude when a key is configured, otherwise the offline keyword engine.
    // Same shape either way, so everything below is unchanged.
    const { extraction, source, fallbackReason: reason } =
      await generateExtraction({
        repName,
        repEmail,
        transcript,
      });
    engineUsed = source;
    fallbackReason = reason;

    console.info(
      `[generate] engine=${source}` +
        (reason ? ` fallbackReason="${reason}"` : "") +
        ` practice="${extraction.practiceName}"`,
    );

    const content = assembleProposal({
      extraction,
      repName,
      repEmail,
      preparedOn: formatPreparedOn(new Date()),
    });

    const slug = await buildUniqueSlug(
      {
        practiceName: extraction.practiceName,
        contactName: extraction.contactName,
      },
      async (candidate) =>
        (await prisma.proposal.count({ where: { slug: candidate } })) > 0,
    );

    const proposal = await prisma.proposal.create({
      data: {
        slug,
        repName,
        repEmail,
        practiceName: extraction.practiceName,
        contactName: extraction.contactName,
        transcript,
        proposalJson: content,
        status: ProposalStatus.Draft,
        version: 1,
      },
    });

    // One tracking row per successful generation. Written after the proposal
    // exists, so the log can never reference something that was never saved.
    await recordGeneration({
      aeName: repName,
      practiceName: proposal.practiceName,
      contactName: proposal.contactName,
      proposalUrl: proposalUrlFor(proposal.slug),
    });

    proposalId = proposal.id;
  } catch (error) {
    if (error instanceof ProposalExtractionError) {
      return { ok: false, message: error.message };
    }

    console.error("generateProposal failed", error);

    // A stopped local database is by far the most common failure here, and the
    // raw Prisma message is a wall of Turbopack-mangled identifiers. Name the
    // actual problem and the actual fix.
    const raw = error instanceof Error ? error.message : String(error);
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    if (
      code === "ECONNREFUSED" ||
      code === "P1001" ||
      /ECONNREFUSED|Can't reach database server|Connection terminated/i.test(raw)
    ) {
      return {
        ok: false,
        message:
          "The database isn't running, so the proposal couldn't be saved. " +
          "Start it with `npm run db:dev`, then try again — your transcript is " +
          "still in the box.",
      };
    }

    return {
      ok: false,
      message: `Could not generate the proposal: ${raw}`,
    };
  }

  // Outside the try/catch on purpose: redirect() signals by throwing, and
  // catching it would swallow the navigation.
  const params = new URLSearchParams({ engine: engineUsed });
  if (fallbackReason) params.set("fallback", fallbackReason);
  redirect(`/editor/${proposalId}?${params.toString()}`);
}

/**
 * Step 8: persist editor changes. Only `proposal_json`, `updated_at` and
 * `version` move — Claude is not called again.
 */
export async function saveProposalContent(
  id: string,
  content: ProposalContent,
): Promise<MutationResult> {
  const parsed = proposalContentSchema.safeParse(content);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: `The proposal structure is invalid: ${issue?.path.join(".")} ${issue?.message}`,
    };
  }

  try {
    const existing = await prisma.proposal.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      return { ok: false, message: "That proposal no longer exists." };
    }

    await prisma.proposal.update({
      where: { id },
      data: {
        proposalJson: parsed.data,
        // updated_at moves automatically via @updatedAt.
        version: { increment: 1 },
      },
    });

    revalidatePath(`/editor/${id}`);
    revalidatePath(`/lp/${existing.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("saveProposalContent failed", error);
    return { ok: false, message: "Could not save. Please try again." };
  }
}

/** Step 9: publish. The landing page only renders once status is Published. */
export async function publishProposal(id: string): Promise<MutationResult> {
  try {
    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status: ProposalStatus.Published, publishedAt: new Date() },
      select: { slug: true },
    });

    revalidatePath(`/editor/${id}`);
    revalidatePath(`/lp/${proposal.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("publishProposal failed", error);
    return { ok: false, message: "Could not publish. Please try again." };
  }
}

/**
 * Writes the tracking entry the rep confirms in the dialog that opens after a
 * successful publish.
 *
 * Updates the row created at generation rather than inserting a second one:
 * inserting again would double-count the proposal in the per-salesperson
 * totals, which is the number this table exists to produce.
 */
export async function confirmProposalTracking(
  id: string,
  fields: { aeName: string; practiceName: string; contactName: string },
): Promise<MutationResult> {
  const aeName = fields.aeName.trim();
  const practiceName = fields.practiceName.trim();
  const contactName = fields.contactName.trim();

  if (!aeName) return { ok: false, message: "Salesperson name is required." };
  if (!practiceName) return { ok: false, message: "Practice name is required." };

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!proposal) {
      return { ok: false, message: "That proposal no longer exists." };
    }

    await confirmTracking({
      slug: proposal.slug,
      aeName,
      practiceName,
      contactName,
    });

    // Keep the proposal's own columns in step, so the homepage list and the
    // tracking report don't disagree about who the prospect is.
    await prisma.proposal.update({
      where: { id },
      data: { repName: aeName, practiceName, contactName },
    });

    revalidatePath("/tracking");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("confirmProposalTracking failed", error);
    return { ok: false, message: "Could not save the tracking details." };
  }
}

/** Return a published proposal to Draft, taking the public page offline. */
export async function unpublishProposal(id: string): Promise<MutationResult> {
  try {
    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status: ProposalStatus.Draft },
      select: { slug: true },
    });

    revalidatePath(`/editor/${id}`);
    revalidatePath(`/lp/${proposal.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("unpublishProposal failed", error);
    return { ok: false, message: "Could not unpublish. Please try again." };
  }
}
