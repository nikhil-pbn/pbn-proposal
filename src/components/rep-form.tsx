"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { generateProposal } from "@/server/proposal/actions";
import {
  transcriptInputSchema,
  type TranscriptInput,
} from "@/server/validation/transcript-input";
import { cn } from "@/lib/utils";

export function RepForm({ defaultTranscript }: { defaultTranscript?: string }) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<TranscriptInput>({
    resolver: zodResolver(transcriptInputSchema),
    defaultValues: {
      repName: "",
      repEmail: "",
      transcript: defaultTranscript ?? "",
    },
  });

  // useWatch, not form.watch(): watch() returns a function the React Compiler
  // can't memoize, which disables optimisation for the whole component.
  const transcript =
    useWatch({ control: form.control, name: "transcript" }) ?? "";

  const errors = form.formState.errors;

  function onSubmit(values: TranscriptInput) {
    setServerError(null);
    startTransition(async () => {
      // On success the action redirects, so nothing comes back.
      const result = await generateProposal(values);
      if (result?.ok === false) {
        setServerError(result.message);
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          form.setError(field as keyof TranscriptInput, { message });
        }
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="repName" className="text-sm font-medium">
            Your name
          </Label>
          <Input
            id="repName"
            className="h-10"
            placeholder="Kelly Geisser"
            autoComplete="name"
            aria-invalid={Boolean(errors.repName)}
            {...form.register("repName")}
          />
          {errors.repName && (
            <p className="text-sm text-destructive">{errors.repName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="repEmail" className="text-sm font-medium">
            Your email
          </Label>
          <Input
            id="repEmail"
            type="email"
            className="h-10"
            placeholder="kelly@practicenumbers.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.repEmail)}
            {...form.register("repEmail")}
          />
          {errors.repEmail && (
            <p className="text-sm text-destructive">{errors.repEmail.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="transcript" className="text-sm font-medium">
            Sales call transcript
          </Label>
          <span
            className={cn(
              "text-xs tabular-nums",
              transcript.length > 0 && transcript.length < 200
                ? "text-amber-600"
                : "text-muted-foreground",
            )}
          >
            {transcript.length.toLocaleString()} characters
          </span>
        </div>

        <Textarea
          id="transcript"
          rows={14}
          className="resize-y bg-background font-mono text-[13px] max-h-80 h-full leading-relaxed"
          placeholder={
            "Paste the full transcript — a Zoom .vtt export works as-is.\n\n" +
            "Kelly: Thanks for making time. You're on Dentrix, right?\n" +
            "Noah: Dentrix, yeah. Going on nine years…"
          }
          aria-invalid={Boolean(errors.transcript)}
          {...form.register("transcript")}
        />

        {errors.transcript ? (
          <p className="text-sm text-destructive">{errors.transcript.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            The whole call. More context produces a more specific proposal.
          </p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden
          />
          <p className="text-destructive">{serverError}</p>
        </div>
      )}

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {pending
            ? "Reading the transcript and drafting — don't close the tab."
            : "You'll land in the editor, where nothing is final until you publish."}
        </p>

        <Button type="submit" size="lg" disabled={pending} className="shadow-sm">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden />
              Generate proposal
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
