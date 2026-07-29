import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic client singleton. Server-only — `ANTHROPIC_API_KEY` must never be
 * exposed to the browser, so this module is only ever imported from server
 * code, and the key is deliberately not prefixed with NEXT_PUBLIC_.
 *
 * Lazy for the same reason as the Prisma client: `next build` imports server
 * modules while prerendering, and the key isn't necessarily present at build
 * time. Constructed on first use with a readable error if it's missing.
 */

const globalForAnthropic = globalThis as unknown as {
  __pbnAnthropic?: Anthropic;
};

function createClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env (server-side only — never " +
        "prefix it with NEXT_PUBLIC_).",
    );
  }

  return new Anthropic({
    apiKey,
    // A proposal generation is a single long call; one retry is plenty and
    // keeps a failure from tripling the wait for the rep.
    maxRetries: 1,
  });
}

export function getAnthropic(): Anthropic {
  if (!globalForAnthropic.__pbnAnthropic) {
    globalForAnthropic.__pbnAnthropic = createClient();
  }
  return globalForAnthropic.__pbnAnthropic;
}

/** True when a key is configured, for surfacing a useful message in the UI. */
export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
