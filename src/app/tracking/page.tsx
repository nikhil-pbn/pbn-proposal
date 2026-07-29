import Link from "next/link";
import type { Metadata } from "next";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { recentGenerations, trackingSummary } from "@/server/tracking/record";
import { SystemStatusToasts } from "@/components/system-status-toasts";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getSystemStatus } from "@/server/system/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proposal tracking",
  // `robots` comes from the root layout; declaring it here would replace it.
};

/**
 * Tracking rows are a historical log, so `proposal_url` is not uniformly
 * shaped: early rows were written before NEXT_PUBLIC_APP_URL was set and hold a
 * bare "/lp/slug", later ones hold a full "http://host/lp/slug". Both of these
 * cope with either form rather than assuming.
 */
function pathOf(url: string): string {
  const match = /\/lp\/[^/?#]+/.exec(url);
  return match?.[0] ?? url;
}

function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  return `${base}${url}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function TrackingPage() {
  // Sequential rather than Promise.all. Neon pools properly so concurrency is now
  // safe, but these two feed one page that can't render without both, and running
  // them in series keeps the failure attributable to a single query.
  let summary: Awaited<ReturnType<typeof trackingSummary>> | null = null;
  let log: Awaited<ReturnType<typeof recentGenerations>> = [];
  let error: string | null = null;

  try {
    summary = await trackingSummary();
    log = await recentGenerations();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Database unavailable.";
  }

  // Only the database. This page reads the log — it never generates a proposal,
  // so the generation engine is none of its business.
  const status = await getSystemStatus(["database"]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <SystemStatusToasts issues={status.issues} />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Proposal tracking
          </h1>
          <p className="mt-2 text-muted-foreground">
            Internal reporting only. One row per proposal, confirmed by the
            salesperson at publish.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">&larr; Back</Link>
        </Button>
      </header>

      {error ? (
        <div className="flex gap-3 rounded-lg border bg-muted/40 p-5 text-sm">
          <Database
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div>
            <p className="font-medium text-foreground">
              Can&apos;t reach the database
            </p>
            <p className="mt-1 text-muted-foreground">
              Start it with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                npm run db:dev
              </code>
              , then reload.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
            <div className="bg-card p-5">
              <p className="text-3xl font-semibold tracking-tight text-brand">
                {summary?.totalProposals ?? 0}
              </p>
              <p className="mt-1 font-medium">Proposals tracked</p>
            </div>
            <div className="bg-card p-5">
              <p className="text-3xl font-semibold tracking-tight text-brand">
                {summary?.totalAes ?? 0}
              </p>
              <p className="mt-1 font-medium">Salespeople</p>
            </div>
            <div className="bg-card p-5">
              <p className="text-3xl font-semibold tracking-tight text-brand">
                {summary && summary.totalAes > 0
                  ? (summary.totalProposals / summary.totalAes).toFixed(1)
                  : "0"}
              </p>
              <p className="mt-1 font-medium">Average per salesperson</p>
            </div>
          </div>

          <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            By salesperson
          </h2>
          {summary && summary.rows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Salesperson</TableHead>
                    <TableHead className="text-right">Proposals</TableHead>
                    <TableHead className="text-right">Practices</TableHead>
                    <TableHead>Most recent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.rows.map((row) => (
                    <TableRow key={row.aeName}>
                      <TableCell className="font-medium">{row.aeName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.proposals}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.practices}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.latest)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nothing tracked yet. Publish a proposal and confirm its details.
            </p>
          )}

          <Separator className="my-10" />

          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Full log ({log.length})
          </h2>
          {log.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-36">AE Name</TableHead>
                    <TableHead className="min-w-40">Practice Name</TableHead>
                    <TableHead className="min-w-32">Contact Name</TableHead>
                    <TableHead className="min-w-56">URL</TableHead>
                    <TableHead className="min-w-32">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.aeName}</TableCell>
                      <TableCell>{row.practiceName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.contactName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link
                            href={row.proposalUrl}
                            target="_blank"
                            title={row.proposalUrl}
                            className="truncate font-mono text-xs text-brand-accent hover:underline"
                          >
                            {pathOf(row.proposalUrl)}
                          </Link>
                          <CopyLinkButton url={absoluteUrl(row.proposalUrl)} />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No entries yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}
