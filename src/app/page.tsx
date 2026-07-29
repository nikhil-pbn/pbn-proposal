import Link from "next/link";
import {
  BarChart3,
  Database,
  ExternalLink,
  FileText,
  KeyRound,
  Pencil,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RepForm } from "@/components/rep-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { SystemStatusToasts } from "@/components/system-status-toasts";
import { generationSource } from "@/server/proposal/generate";
import { getSystemStatus } from "@/server/system/status";
import { proposalUrlFor } from "@/server/tracking/record";
import { prisma } from "@/server/db";

/** Reads the database, so never prerendered. */
export const dynamic = "force-dynamic";

type RecentProposal = {
  id: string;
  slug: string;
  practiceName: string;
  contactName: string;
  status: string;
  version: number;
  updatedAt: Date;
};

/**
 * The list is a convenience, not the point of the page — if the database is
 * unreachable the rep should still be able to use the form, so a failure here
 * degrades to a notice instead of a 500.
 */
async function loadRecent(): Promise<
  { ok: true; rows: RecentProposal[] } | { ok: false }
> {
  try {
    const rows = await prisma.proposal.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        slug: true,
        practiceName: true,
        contactName: true,
        status: true,
        version: true,
        updatedAt: true,
      },
    });
    return { ok: true, rows };
  } catch {
    return { ok: false };
  }
}

function relativeDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function HomePage() {
  const recent = await loadRecent();
  const source = generationSource();
  // Both: this page lists proposals from the database and is where generation
  // is triggered, so a degraded engine is directly relevant before you paste.
  const status = await getSystemStatus(["database", "generation"]);

  return (
    <div className="min-h-full bg-muted/40">
      <SystemStatusToasts issues={status.issues} />
      {/* Top bar */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-6">
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground"
          >
            PbN
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Proposal Builder
          </span>
          <nav className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/tracking">
                <BarChart3 className="size-3.5" />
                Tracking
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/preview">
                <FileText className="size-3.5" />
                Template
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pb-20">
        {/* Hero */}
        <div className="pt-14 pb-10 text-center sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <Sparkles className="size-3 text-brand-accent" aria-hidden />
            Transcript in, proposal out
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn a sales call into a proposal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Paste the transcript. You&apos;ll get an editable proposal you can
            review, adjust and send as a link.
          </p>
        </div>

        {source === "offline" && (
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-xs">
            <KeyRound
              className="mt-0.5 size-4 shrink-0 text-amber-600"
              aria-hidden
            />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                Offline mode — proposals are built without AI
              </p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                No{" "}
                <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-xs">
                  ANTHROPIC_API_KEY
                </code>{" "}
                with credit, so the transcript is matched against keywords rather
                than read. You&apos;ll still get a transcript-specific proposal,
                but{" "}
                <strong className="font-semibold text-foreground">
                  read every section before sending
                </strong>
                .
              </p>
            </div>
          </div>
        )}

        {/* The form, in an elevated card */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <RepForm />
        </section>

        {/* Recent proposals */}
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Recent proposals
            </h2>
            {recent.ok && recent.rows.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {recent.rows.length} most recent
              </span>
            )}
          </div>

          {!recent.ok ? (
            <div className="flex gap-3 rounded-2xl border bg-card p-6 shadow-sm">
              <Database
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  Can&apos;t reach the database
                </p>
                <p className="mt-1 text-muted-foreground">
                  Start it with{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    npm run db:dev
                  </code>
                  , then reload.
                </p>
              </div>
            </div>
          ) : recent.rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
              <FileText
                className="mx-auto size-5 text-muted-foreground"
                aria-hidden
              />
              <p className="mt-3 text-sm font-medium">No proposals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste a transcript above to create the first one.
              </p>
            </div>
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
              {recent.rows.map((row) => (
                // Not one big <Link> any more: the row now holds a second link
                // to the public page, and an <a> can't nest inside an <a>.
                <li
                  key={row.id}
                  className="group flex items-center gap-2 px-5 py-4 transition-colors hover:bg-muted/50 sm:gap-3"
                >
                  {/* Plain text. The row's actions live in the buttons at the
                      end — making the text clickable too just creates three
                      overlapping ways to do the same two things. */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {row.practiceName}
                    </p>
                    <p className="mt-0.5 flex min-w-0 items-center text-sm text-muted-foreground">
                      <span className="truncate">{row.contactName}</span>
                      <span className="mx-1.5 shrink-0 text-border">
                        &middot;
                      </span>
                      <span className="truncate font-mono text-xs">
                        /lp/{row.slug}
                      </span>
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-muted-foreground">
                      {relativeDate(row.updatedAt)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground/70">
                      v{row.version}
                    </p>
                  </div>

                  <Badge
                    variant={row.status === "Published" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {row.status}
                  </Badge>

                  {row.status === "Published" && (
                    <>
                      <CopyLinkButton url={proposalUrlFor(row.slug)} />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                          >
                            <Link
                              href={`/lp/${row.slug}`}
                              target="_blank"
                              aria-label="Open the proposal the prospect sees"
                            >
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open proposal</TooltipContent>
                      </Tooltip>
                    </>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                      >
                        <Link
                          href={`/editor/${row.id}`}
                          aria-label="Edit this proposal"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
