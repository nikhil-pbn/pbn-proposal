import type { ProposalExtraction } from "@/server/claude/extraction-schema";
import { extractProposal } from "@/server/claude/extract-proposal";
import { hasAnthropicKey } from "@/server/claude/client";
import { buildOfflineExtraction } from "./offline-extraction";

export type GenerationSource = "claude" | "offline";

/** The only accepted values of PROPOSAL_GENERATION. */
export const GENERATION_MODES = ["offline", "claude", "auto"] as const;

export type GenerationConfig = {
  source: GenerationSource;
  /** Set when PROPOSAL_GENERATION held something that isn't a mode above. */
  invalidValue?: string;
};

/**
 * Resolves PROPOSAL_GENERATION into the engine that will actually run.
 *
 *   offline  force keyword matching, even with a funded key
 *   claude   force Claude; recoverable failures still fall back to offline
 *   auto     Claude if a key is set, else offline
 *   unset    same as auto
 *
 * An unrecognised value resolves to **offline**, never Claude. This direction is
 * deliberate: `auto` used to be the catch-all default, so a typo like "onlien"
 * or "ofline" silently found the key and started billing the API. A
 * misconfiguration should cost nothing and be loud — `invalidValue` is what the
 * status layer turns into a toast.
 */
export function generationConfig(): GenerationConfig {
  const raw = process.env.PROPOSAL_GENERATION?.trim();
  const auto = (): GenerationSource =>
    hasAnthropicKey() ? "claude" : "offline";

  if (!raw) return { source: auto() };

  switch (raw.toLowerCase()) {
    case "offline":
      return { source: "offline" };
    case "claude":
      return { source: "claude" };
    case "auto":
      return { source: auto() };
    default:
      return { source: "offline", invalidValue: raw };
  }
}

/** The engine only. Use `generationConfig()` when you also need to report why. */
export function generationSource(): GenerationSource {
  return generationConfig().source;
}

export type GeneratedExtraction = {
  extraction: ProposalExtraction;
  source: GenerationSource;
  /** Set when Claude was attempted, failed, and offline covered for it. */
  fallbackReason?: string;
};

/**
 * Claude failures that offline mode can cover for. A key that exists but has no
 * credit is the common one — key presence alone is not proof of usable access.
 * Anything not matched here is a real error and is re-thrown, so genuine bugs
 * don't hide behind a silent downgrade.
 */
function isRecoverable(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("credit balance") || lower.includes("billing")) {
    return "Anthropic account has no credit";
  }
  if (lower.includes("authentication") || lower.includes("invalid x-api-key")) {
    return "Anthropic API key is invalid";
  }
  if (lower.includes("rate_limit") || lower.includes("rate limit")) {
    return "Anthropic rate limit reached";
  }
  if (lower.includes("permission") || lower.includes("403")) {
    return "Anthropic key lacks access to this model";
  }
  return null;
}

/**
 * Produces the extraction, from whichever engine is active. Both return the
 * same shape, so nothing downstream — the assembler, the editor, the landing
 * page — needs to know or care which one ran.
 */
export async function generateExtraction(input: {
  transcript: string;
  repName: string;
  repEmail: string;
}): Promise<GeneratedExtraction> {
  const offline = () =>
    buildOfflineExtraction({
      transcript: input.transcript,
      repName: input.repName,
    });

  if (generationSource() === "offline") {
    return { extraction: offline(), source: "offline" };
  }

  try {
    const { extraction } = await extractProposal(input);
    return { extraction, source: "claude" };
  } catch (error) {
    const reason = isRecoverable(error);
    if (!reason) throw error;

    // The rep still gets a usable proposal instead of a dead end.
    console.warn(`Claude unavailable (${reason}) — generated offline instead.`);
    return { extraction: offline(), source: "offline", fallbackReason: reason };
  }
}
