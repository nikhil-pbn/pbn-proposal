import { z } from "zod";

/**
 * Validates the homepage form before anything reaches Claude or the database.
 *
 * Deliberately strict on the transcript length: a two-line paste produces a
 * confident-looking proposal built on nothing, which is worse than an error
 * message. Better to refuse early.
 */
export const transcriptInputSchema = z.object({
  repName: z
    .string()
    .trim()
    .min(1, "Your name is required.")
    .max(255, "That name is too long."),

  repEmail: z
    .string()
    .trim()
    .min(1, "Your email is required.")
    .email("That doesn't look like an email address.")
    .max(255, "That email is too long."),

  transcript: z
    .string()
    .trim()
    .min(
      200,
      "That transcript is too short to build a proposal from — paste the full call.",
    )
    .max(
      500_000,
      "That transcript is very long. Split it, or trim to the relevant part of the call.",
    ),
});

export type TranscriptInput = z.infer<typeof transcriptInputSchema>;

/** Field-keyed errors, shaped for rendering next to the inputs. */
export type TranscriptInputErrors = Partial<
  Record<keyof TranscriptInput, string>
>;

export function getFieldErrors(
  error: z.ZodError<TranscriptInput>,
): TranscriptInputErrors {
  const errors: TranscriptInputErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "repName" || field === "repEmail" || field === "transcript") &&
      !errors[field]
    ) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
