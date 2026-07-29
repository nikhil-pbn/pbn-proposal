import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getAnthropic } from "./client";
import { buildSystemPrompt, buildUserMessage } from "./prompt";
import { extractionSchema, type ProposalExtraction } from "./extraction-schema";

/**
 * Transcript -> structured proposal content.
 *
 * Uses structured outputs, so the response is constrained to
 * `extractionSchema` and validated by the SDK before we ever see it. That is
 * what makes "Claude returns JSON only, no markdown" a guarantee rather than a
 * prompt instruction we hope holds.
 */

const MODEL = "claude-opus-5";

/**
 * Generous because thinking is ON BY DEFAULT on Opus 5 and `max_tokens` caps
 * thinking + output together. Too low and the JSON truncates mid-object.
 */
const MAX_TOKENS = 32_000;

export type ExtractionResult = {
  extraction: ProposalExtraction;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  };
  /** The model that actually served the response — differs if a fallback ran. */
  servedByModel: string;
};

/** Thrown for every expected failure, so callers can show the rep something useful. */
export class ProposalExtractionError extends Error {
  constructor(
    message: string,
    readonly reason:
      | "refusal"
      | "truncated"
      | "unparsable"
      | "empty_transcript"
      | "api_error",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ProposalExtractionError";
  }
}

export async function extractProposal(input: {
  transcript: string;
  repName: string;
  repEmail: string;
}): Promise<ExtractionResult> {
  if (input.transcript.trim().length === 0) {
    throw new ProposalExtractionError(
      "The transcript is empty.",
      "empty_transcript",
    );
  }

  const client = getAnthropic();

  let message;
  try {
    // Streaming, not `.parse()`: a long transcript plus a high max_tokens can
    // otherwise sit long enough to hit an HTTP timeout. `finalMessage()` still
    // gives us `parsed_output`.
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,

      // Opus 5's safety classifiers can decline a request. Dental transcripts
      // are healthcare-adjacent, so a false positive is unlikely but possible;
      // "default" lets the API re-serve the request on a fallback model in the
      // same call, routed by refusal category.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",

      // The system prompt is stable and sizeable (the whole product catalog),
      // so cache it — every subsequent generation reads it at ~0.1x cost. The
      // volatile transcript deliberately sits in the user turn, after this
      // breakpoint, so it never invalidates the cache.
      system: [
        {
          type: "text",
          text: buildSystemPrompt(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserMessage(input) }],
      output_config: {
        format: betaZodOutputFormat(extractionSchema),
        effort: "high",
      },
    });

    message = await stream.finalMessage();
  } catch (error) {
    throw new ProposalExtractionError(
      error instanceof Error
        ? `Claude request failed: ${error.message}`
        : "Claude request failed.",
      "api_error",
      { cause: error },
    );
  }

  // Check stop_reason BEFORE reading content. On a refusal the content array is
  // empty or partial, so anything that indexes into it would blow up here.
  if (message.stop_reason === "refusal") {
    const category = message.stop_details?.category ?? "unspecified";
    throw new ProposalExtractionError(
      `Claude declined to process this transcript (category: ${category}). ` +
        "This is usually a false positive on clinical content — try again, or " +
        "trim the transcript to the commercial part of the call.",
      "refusal",
    );
  }

  if (message.stop_reason === "max_tokens") {
    throw new ProposalExtractionError(
      "The response hit the token limit and the proposal is incomplete. " +
        "The transcript may be unusually long — try splitting it.",
      "truncated",
    );
  }

  if (!message.parsed_output) {
    throw new ProposalExtractionError(
      "Claude returned a response that did not match the proposal schema.",
      "unparsable",
    );
  }

  return {
    extraction: message.parsed_output,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
    },
    servedByModel: message.model,
  };
}
