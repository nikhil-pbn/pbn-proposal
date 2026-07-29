import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProposalRenderer } from "@/components/proposal/proposal-renderer";
import { prisma } from "@/server/db";
import { ProposalStatus } from "@/server/db";
import { proposalContentSchema } from "@/types/proposal";

/** Reads the database and must reflect edits immediately after a save. */
export const dynamic = "force-dynamic";

/**
 * The public landing page. Only a Published proposal renders — a Draft 404s, so
 * a rep can't accidentally share a half-finished document by pasting the link
 * early.
 *
 * Note what is deliberately NOT selected below: `transcript`, `repEmail` and
 * anything from proposal_tracking. The prospect must never receive the raw call
 * transcript or internal reporting data.
 */
async function loadPublished(slug: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    select: {
      practiceName: true,
      contactName: true,
      status: true,
      proposalJson: true,
    },
  });

  if (!proposal || proposal.status !== ProposalStatus.Published) return null;

  const parsed = proposalContentSchema.safeParse(proposal.proposalJson);
  if (!parsed.success) return null;

  return { ...proposal, content: parsed.data };
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const proposal = await loadPublished(slug);

  if (!proposal) return { title: "Proposal not found" };

  return {
    title: `Proposal for ${proposal.practiceName} — Practice by Numbers`,
    description: `Prepared for ${proposal.contactName} at ${proposal.practiceName}.`,
    // `robots` comes from the root layout. Next merges metadata shallowly, so
    // re-declaring it here would replace that policy rather than extend it.
  };
}

export default async function LandingPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const proposal = await loadPublished(slug);

  // Draft, missing, or structurally invalid all render the same 404 — the
  // difference is internal and shouldn't leak to whoever has the link.
  if (!proposal) notFound();

  return <ProposalRenderer content={proposal.content} />;
}
