import { randomBytes } from "node:crypto";

/**
 * Public slug for a proposal, e.g. "new-horizons-noah-a83dj2".
 *
 * Shape: kebab(practice) + contact first name + 6 random chars. The random
 * suffix is what makes the URL unguessable — the landing page has no auth, so
 * "new-horizons-noah" alone would let anyone walk the namespace and read other
 * practices' proposals.
 */

function kebab(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** 6 chars from an alphabet with no 0/o/1/l/i, so a slug read aloud is unambiguous. */
function suffix(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}

export function buildSlug(input: {
  practiceName: string;
  contactName: string;
}): string {
  const practice = kebab(input.practiceName);
  const firstName = kebab(input.contactName.split(/\s+/)[0] ?? "");

  const stem = [practice, firstName].filter(Boolean).join("-") || "proposal";
  return `${stem}-${suffix()}`;
}

/**
 * Retries on collision. Unique in practice from the random suffix alone, but the
 * slug column is UNIQUE so a duplicate would otherwise surface as a raw
 * Prisma P2002 in the rep's face.
 */
export async function buildUniqueSlug(
  input: { practiceName: string; contactName: string },
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = buildSlug(input);
    if (!(await exists(slug))) return slug;
  }
  // Astronomically unlikely; fall back to something that cannot collide.
  return `${buildSlug(input)}-${Date.now().toString(36)}`;
}
