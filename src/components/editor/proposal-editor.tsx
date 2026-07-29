"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  Eye,
  KeyRound,
  Loader2,
  Rocket,
  Save,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProposalRenderer } from "@/components/proposal/proposal-renderer";
import { SectionCard } from "./section-card";
import { TrackingDialog } from "./tracking-dialog";
import {
  publishProposal,
  saveProposalContent,
  unpublishProposal,
} from "@/server/proposal/actions";
import type { ProposalContent, ProposalSection } from "@/types/proposal";

type Mode = "edit" | "preview";

/** Rewrites `order` to match array position, so it's always 1..n with no gaps. */
function renumber(sections: ProposalSection[]): ProposalSection[] {
  return sections.map((section, index) => ({ ...section, order: index + 1 }));
}

export function ProposalEditor({
  proposalId,
  slug,
  status,
  version,
  publicUrl,
  initialContent,
  repName,
  practiceName,
  contactName,
  offlineMode = false,
}: {
  proposalId: string;
  slug: string;
  status: "Draft" | "Published";
  version: number;
  publicUrl: string;
  initialContent: ProposalContent;
  /** Prefill values for the tracking dialog. */
  repName: string;
  practiceName: string;
  contactName: string;
  /** True when proposals are being built without Claude. */
  offlineMode?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("edit");
  const [sections, setSections] = useState<ProposalSection[]>(() =>
    renumber([...initialContent.sections].sort((a, b) => a.order - b.order)),
  );
  const [dirty, setDirty] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();

  function update(next: ProposalSection[]) {
    setSections(renumber(next));
    setDirty(true);
  }

  function save(options?: { silent?: boolean }): Promise<boolean> {
    return new Promise((resolve) => {
      startSaving(async () => {
        const result = await saveProposalContent(proposalId, { sections });
        if (result.ok) {
          setDirty(false);
          if (!options?.silent) toast.success("Saved");
          router.refresh();
          resolve(true);
        } else {
          toast.error(result.message);
          resolve(false);
        }
      });
    });
  }

  function onPublish() {
    startPublishing(async () => {
      // Publishing stale content is the worst outcome here, so flush edits first.
      if (dirty) {
        const saved = await save({ silent: true });
        if (!saved) return;
      }
      const result = await publishProposal(proposalId);
      if (result.ok) {
        toast.success("Published — the link is live");
        router.refresh();
        // The proposal is already live; this only confirms the reporting entry.
        setTrackingOpen(true);
      } else {
        toast.error(result.message);
      }
    });
  }

  function onUnpublish() {
    startPublishing(async () => {
      const result = await unpublishProposal(proposalId);
      if (result.ok) {
        toast.success("Back to draft — the public link now 404s");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  const content: ProposalContent = { sections };

  return (
    <div className="min-h-full">
      <TrackingDialog
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        proposalId={proposalId}
        publicUrl={publicUrl}
        defaultAeName={repName}
        defaultPracticeName={practiceName}
        defaultContactName={contactName}
        onSaved={() => router.refresh()}
      />

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">&larr; All proposals</Link>
          </Button>

          <div className="mr-auto flex items-center gap-2">
            <Badge variant={status === "Published" ? "default" : "secondary"}>
              {status}
            </Badge>
            <span className="text-xs tabular-nums text-muted-foreground">
              v{version}
            </span>
            {dirty && (
              <span className="text-xs font-medium text-brand-accent">
                Unsaved changes
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          >
            <Eye className="size-3.5" />
            {mode === "edit" ? "Preview" : "Back to editing"}
          </Button>

          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy link
          </Button>

          {status === "Published" && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/lp/${slug}`} target="_blank">
                  <ExternalLink className="size-3.5" />
                  Open
                </Link>
              </Button>
              {/* Reopen the tracking form after the fact — a rep who skipped it
                  on publish, or attributed it to the wrong person, needs a way
                  back in. */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTrackingOpen(true)}
              >
                <ClipboardList className="size-3.5" />
                Tracking
              </Button>
            </>
          )}

          <Button size="sm" variant="secondary" onClick={() => save()} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </Button>

          {status === "Draft" ? (
            <Button size="sm" onClick={onPublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Rocket className="size-3.5" />
              )}
              Publish
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnpublish}
              disabled={publishing}
            >
              {publishing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Undo2 className="size-3.5" />
              )}
              Unpublish
            </Button>
          )}
        </div>
      </header>

      {mode === "preview" ? (
        <ProposalRenderer content={content} />
      ) : (
        <div className="mx-auto w-full max-w-5xl space-y-4 px-6 py-8">
          {offlineMode && (
            <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 p-4 text-sm">
              <KeyRound
                className="mt-0.5 size-4 shrink-0 text-amber-600"
                aria-hidden
              />
              <p className="text-muted-foreground">
                <strong className="font-medium text-foreground">
                  Built in offline mode
                </strong>{" "}
                — sections were assembled by keyword matching, not read by Claude.
                Check the wording against what was actually said before you
                publish.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {sections.length} sections. Editing changes only this proposal&apos;s
            stored content — the transcript is never re-processed.
          </p>

          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              isOpen={openId === section.id}
              onToggleOpen={() =>
                setOpenId(openId === section.id ? null : section.id)
              }
              onChange={(data) =>
                update(
                  sections.map((candidate) =>
                    candidate.id === section.id
                      ? // Cast is safe in practice: the field editor only replaces
                        // leaf values in place, and the server re-validates the
                        // whole document against proposalContentSchema on save.
                        ({ ...candidate, data } as ProposalSection)
                      : candidate,
                  ),
                )
              }
              onToggleVisible={() =>
                update(
                  sections.map((candidate) =>
                    candidate.id === section.id
                      ? { ...candidate, visible: !candidate.visible }
                      : candidate,
                  ),
                )
              }
              onMoveUp={() => {
                if (index === 0) return;
                const next = [...sections];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                update(next);
              }}
              onMoveDown={() => {
                if (index === sections.length - 1) return;
                const next = [...sections];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                update(next);
              }}
              onDelete={() => {
                update(sections.filter((c) => c.id !== section.id));
                toast.success("Section deleted — save to make it permanent");
              }}
            />
          ))}

          {sections.length === 0 && (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Every section has been deleted. There&apos;s nothing to publish.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
