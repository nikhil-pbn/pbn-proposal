import { prisma } from "@/server/db";

/**
 * The reporting log. Exactly five fields, written once per successful
 * generation and never updated, so it stays a faithful record of what was
 * generated and who it went to.
 *
 * Deliberately has no foreign key to `proposals` — it must survive a proposal
 * being deleted, otherwise the log develops holes precisely where someone
 * cleaned up.
 */
export async function recordGeneration(input: {
  /** The AE — the rep name from the form. */
  aeName: string;
  practiceName: string;
  contactName: string;
  /** Absolute if NEXT_PUBLIC_APP_URL is set, else the path. */
  proposalUrl: string;
}): Promise<void> {
  await prisma.proposalTracking.create({
    data: {
      aeName: input.aeName,
      practiceName: input.practiceName,
      contactName: input.contactName,
      proposalUrl: input.proposalUrl,
    },
  });
}

/** Builds the shareable URL that gets logged and copied by the rep. */
export function proposalUrlFor(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  return `${base}/lp/${slug}`;
}

/** Most recent generations, for an internal reporting view. */
export async function recentGenerations(limit = 200) {
  return prisma.proposalTracking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Confirms the log entry at publish time.
 *
 * The row is created when the proposal is generated, but the rep then edits the
 * proposal — including the practice and contact name — before publishing. Left
 * alone, the log would keep whatever Claude first guessed. So publish updates
 * the existing row rather than inserting a second one; inserting again would
 * double-count the proposal in the per-rep totals, which is the number this
 * table exists to produce.
 */
export async function confirmTracking(input: {
  slug: string;
  aeName: string;
  practiceName: string;
  contactName: string;
}): Promise<void> {
  const existing = await prisma.proposalTracking.findFirst({
    where: { proposalUrl: { endsWith: `/lp/${input.slug}` } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const data = {
    aeName: input.aeName,
    practiceName: input.practiceName,
    contactName: input.contactName,
    proposalUrl: proposalUrlFor(input.slug),
  };

  // Upsert by hand: there's no unique key on proposalUrl, and adding one would
  // change the five-field table.
  if (existing) {
    await prisma.proposalTracking.update({ where: { id: existing.id }, data });
  } else {
    await prisma.proposalTracking.create({ data });
  }
}

export type AeSummaryRow = {
  aeName: string;
  proposals: number;
  practices: number;
  latest: Date;
};

/** Proposals per salesperson — the headline number for this table. */
export async function trackingSummary(): Promise<{
  totalProposals: number;
  totalAes: number;
  rows: AeSummaryRow[];
}> {
  const grouped = await prisma.proposalTracking.groupBy({
    by: ["aeName"],
    _count: { _all: true },
    _max: { createdAt: true },
    orderBy: { _count: { aeName: "desc" } },
  });

  // Distinct practices per AE needs a second pass — groupBy can't count
  // distinct on another column. Sequential, because the local database serves
  // one connection at a time.
  const rows: AeSummaryRow[] = [];
  for (const group of grouped) {
    const practices = await prisma.proposalTracking.findMany({
      where: { aeName: group.aeName },
      distinct: ["practiceName"],
      select: { practiceName: true },
    });
    rows.push({
      aeName: group.aeName,
      proposals: group._count._all,
      practices: practices.length,
      latest: group._max.createdAt ?? new Date(0),
    });
  }

  return {
    totalProposals: rows.reduce((sum, row) => sum + row.proposals, 0),
    totalAes: rows.length,
    rows,
  };
}
