import { z } from "zod";
import { PBN_MODULES } from "./pbn-catalog";

/**
 * What Claude returns for a transcript.
 *
 * Deliberately NARROWER than the full proposal. Claude produces only what a
 * transcript can actually tell us. It does not produce:
 *
 *   - section envelopes (id / type / visible / order)  -> assembled in code, so
 *     ids and ordering are deterministic and the editor can rely on them
 *   - pricing plans and prices                          -> from the default
 *     proposal, so a price can never be hallucinated into a customer document
 *   - benefit statistics, timeline, FAQ, CTA            -> fixed PbN content
 *
 * Smaller schema also means a faster, cheaper, more reliable call.
 *
 * Constraint reminder: structured outputs reject string/number constraints
 * (min, max, length), so counts are enforced in the prompt and clamped in the
 * assembler rather than in this schema.
 */
export const extractionSchema = z.object({
  /** The dental practice. Falls back to "the practice" if the call never names it. */
  practiceName: z.string(),
  /** The person on the call. Falls back to "there" if never named. */
  contactName: z.string(),

  /** Tailored hero copy. Should reflect this practice's situation, not boilerplate. */
  heroHeadline: z.string(),
  heroSubheadline: z.string(),

  /** 2–3 paragraphs. First one states where the practice is today. */
  executiveSummary: z.array(z.string()),

  /** Facts stated on the call: PMS, locations, operatories, team size, current tooling. */
  practiceDetails: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),

  /** 3–5 problems, in the prospect's own terms. */
  problems: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      /** The cost of the problem, e.g. "Lost bookings outside office hours". Null if not discussed. */
      impact: z.string().nullable(),
    }),
  ),

  /** One entry per recommended module. Must map back to the problems above. */
  solutions: z.array(
    z.object({
      /** Must be one of the real PbN modules — the enum makes invention impossible. */
      module: z.enum(PBN_MODULES),
      title: z.string(),
      description: z.string(),
      /** Real feature names from PBN_MODULE_FEATURES for this module. */
      bullets: z.array(z.string()),
      /** 0-based indexes into `problems`. Out-of-range values are dropped when assembling. */
      solvesProblemIndexes: z.array(z.number().int()),
    }),
  ),

  comparison: z.object({
    /** What they run today, e.g. "Today (Dentrix + manual)". */
    currentLabel: z.string(),
    rows: z.array(
      z.object({
        capability: z.string(),
        /** Their situation today. Honest, not strawmanned. */
        current: z.string(),
        /** What PbN does instead. */
        pbn: z.string(),
      }),
    ),
  }),

  callSummary: z.object({
    /** e.g. "Noah Stella (New Horizons Dental), Kelly Geisser (Practice by Numbers)". */
    attendees: z.string(),
    /** Factual recap points, including any agreed next step. */
    points: z.array(z.string()),
  }),

  /**
   * Pricing EXPLICITLY discussed on the call, quoted or paraphrased. Null if
   * price never came up. Never a number the model derived on its own — the
   * pricing section itself is built from the default proposal.
   */
  discussedPricing: z.string().nullable(),
});

export type ProposalExtraction = z.infer<typeof extractionSchema>;
