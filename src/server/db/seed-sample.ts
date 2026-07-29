/**
 * Inserts one sample proposal + its tracking row, so Prisma Studio has
 * something to show and the full stack (Prisma client -> pg adapter -> Postgres
 * -> JSONB) is proven before we build the generate flow.
 *
 * Run:    npm run db:seed
 * Delete: remove the rows in Studio, or re-run — it upserts on the slug.
 */
import { prisma } from "./client";
import { buildDefaultProposal } from "@/server/proposal/default-proposal";

const SAMPLE_SLUG = "sample-new-horizons-noah";

async function main() {
  const content = buildDefaultProposal();

  const proposal = await prisma.proposal.upsert({
    where: { slug: SAMPLE_SLUG },
    update: { proposalJson: content },
    create: {
      slug: SAMPLE_SLUG,
      repName: "Kelly Geisser",
      repEmail: "kelly@practicenumbers.com",
      practiceName: "New Horizons Dental",
      contactName: "Noah Stella",
      transcript:
        "SAMPLE ROW — not a real call. Customer currently uses Dentrix. " +
        "Problems: scheduling is slow, no automated reminders, no real-time " +
        "reporting, paper intake forms. Interested in reminders and analytics.",
      proposalJson: content,
    },
  });

  const trackingCount = await prisma.proposalTracking.count({
    where: { proposalUrl: { endsWith: SAMPLE_SLUG } },
  });

  if (trackingCount === 0) {
    await prisma.proposalTracking.create({
      data: {
        aeName: proposal.repName,
        practiceName: proposal.practiceName,
        contactName: proposal.contactName,
        proposalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/lp/${proposal.slug}`,
      },
    });
  }

  const sections = (content.sections ?? []).length;
  console.log(`proposal   id=${proposal.id}`);
  console.log(`           slug=${proposal.slug}`);
  console.log(`           status=${proposal.status} version=${proposal.version}`);
  console.log(`           proposal_json sections=${sections}`);
  console.log(`tracking   rows for this slug=${Math.max(trackingCount, 1)}`);
  console.log(`totals     proposals=${await prisma.proposal.count()} tracking=${await prisma.proposalTracking.count()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
