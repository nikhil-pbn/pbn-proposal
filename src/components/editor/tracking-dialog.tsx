"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmProposalTracking } from "@/server/proposal/actions";

/**
 * Opens once a proposal has published. The proposal is already live at this
 * point — this only confirms the reporting entry, which is why it can be
 * dismissed without blocking anything.
 *
 * Prefilled from the proposal so the common case is one click. The rep can
 * correct the practice or contact name — which often changed while editing —
 * and the salesperson name, which matters because per-rep totals are the whole
 * point of this table.
 */
export function TrackingDialog({
  open,
  onOpenChange,
  ...formProps
}: TrackingFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Published — confirm tracking details</DialogTitle>
          <DialogDescription>
            The proposal is live. These five fields are what the internal report
            uses to count proposals per salesperson.
          </DialogDescription>
        </DialogHeader>

        {/* Mounted only while open, so its state initialises from the current
            props every time. A reset effect would fight the React Compiler. */}
        {open && <TrackingForm {...formProps} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

type TrackingFormProps = {
  proposalId: string;
  publicUrl: string;
  defaultAeName: string;
  defaultPracticeName: string;
  defaultContactName: string;
  onSaved?: () => void;
};

function TrackingForm({
  proposalId,
  publicUrl,
  defaultAeName,
  defaultPracticeName,
  defaultContactName,
  onSaved,
  onDone,
}: TrackingFormProps & { onDone: () => void }) {
  const [aeName, setAeName] = useState(defaultAeName);
  const [practiceName, setPracticeName] = useState(defaultPracticeName);
  const [contactName, setContactName] = useState(defaultContactName);
  const [saving, startSaving] = useTransition();

  function submit() {
    startSaving(async () => {
      const result = await confirmProposalTracking(proposalId, {
        aeName,
        practiceName,
        contactName,
      });
      if (result.ok) {
        toast.success("Tracking details recorded");
        onDone();
        onSaved?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="tracking-ae">Salesperson (AE)</Label>
        <Input
          id="tracking-ae"
          value={aeName}
          onChange={(event) => setAeName(event.target.value)}
          placeholder="Kelly Geisser"
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tracking-practice">Practice name</Label>
          <Input
            id="tracking-practice"
            value={practiceName}
            onChange={(event) => setPracticeName(event.target.value)}
            placeholder="New Horizons Dental"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tracking-contact">Contact name</Label>
          <Input
            id="tracking-contact"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="Noah Stella"
          />
        </div>
      </div>

      {/* URL and date are recorded automatically — shown so the rep can see
          exactly what gets logged, but not editable: the URL must match the
          live page, and the date is when it happened. */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">
          URL &amp; date (recorded automatically)
        </Label>
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <p className="truncate font-mono text-xs">{publicUrl}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onDone}
          disabled={saving}
        >
          Skip for now
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Save tracking details
        </Button>
      </DialogFooter>
    </form>
  );
}
