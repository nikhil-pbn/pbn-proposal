/**
 * Prints what's in the database, without Prisma Studio.
 *
 *   npm run db:check
 *
 * Useful when Studio is being unreliable, in CI, or just to confirm the
 * connection works before debugging anything else.
 */
import { prisma } from "./client";
import { proposalContentSchema } from "@/types/proposal";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const where = url.replace(/\/\/[^@]*@/, "//***:***@");
  console.log(`connection  ${where || "(DATABASE_URL not set)"}\n`);

  // Sequential rather than Promise.all. It no longer has to be — that was forced
  // by the old local WASM server, which served one connection at a time — but two
  // counts in a throwaway script gain nothing from concurrency, and sequential
  // makes a failure unambiguous about which query failed.
  const proposals = await prisma.proposal.count();
  const tracking = await prisma.proposalTracking.count();
  console.log(`proposals          ${proposals} row(s)`);
  console.log(`proposal_tracking  ${tracking} row(s)\n`);

  if (proposals === 0) {
    console.log("No proposals yet. Run `npm run db:seed` for a sample row.");
    return;
  }

  const rows = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      slug: true,
      practiceName: true,
      contactName: true,
      repName: true,
      status: true,
      version: true,
      createdAt: true,
      proposalJson: true,
    },
  });

  for (const row of rows) {
    // Validating here doubles as a check that what's stored still matches the
    // schema the editor and landing page expect.
    const parsed = proposalContentSchema.safeParse(row.proposalJson);
    const shape = parsed.success
      ? `${parsed.data.sections.length} sections, valid`
      : `INVALID: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`;

    console.log(`  /lp/${row.slug}`);
    console.log(`     ${row.practiceName} — ${row.contactName} (AE: ${row.repName})`);
    console.log(`     ${row.status} v${row.version}  ${row.createdAt.toISOString()}`);
    console.log(`     proposal_json: ${shape}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      error instanceof Error ? `FAILED: ${error.message}` : error,
    );
    process.exit(1);
  });
