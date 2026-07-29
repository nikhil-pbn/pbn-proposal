"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Copies a proposal's public URL. Sharing that link is the rep's actual job, so
 * it belongs one click away from the list rather than only inside the editor.
 */
export function CopyLinkButton({
  url,
  label = "Copy proposal link",
}: {
  url: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", { description: url, duration: 3000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", { description: url });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={copy}
          className="size-8 shrink-0"
        >
          {copied ? (
            <Check className="size-3.5 text-brand-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}
