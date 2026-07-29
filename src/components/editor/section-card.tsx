"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FieldEditor } from "./field-editor";
import { SECTION_LABELS, type ProposalSection } from "@/types/proposal";
import { cn } from "@/lib/utils";

/**
 * One section with its toolbar. Hide vs Delete are deliberately separate
 * actions: hiding keeps the content in `proposal_json` with `visible: false`, so
 * it can come back; deleting drops it.
 */
export function SectionCard({
  section,
  isFirst,
  isLast,
  isOpen,
  onToggleOpen,
  onChange,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  section: ProposalSection;
  isFirst: boolean;
  isLast: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onChange: (data: Record<string, unknown>) => void;
  onToggleVisible: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const data = section.data as Record<string, unknown>;

  return (
    <section
      className={cn(
        "rounded-xl border bg-card",
        !section.visible && "opacity-60",
      )}
    >
      <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h3 className="mr-auto font-medium text-foreground">
          {SECTION_LABELS[section.type]}
          {!section.visible && (
            <Badge variant="secondary" className="ml-2 align-middle">
              Hidden
            </Badge>
          )}
        </h3>

        <Button
          variant={isOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleOpen}
        >
          <Pencil className="size-3.5" />
          {isOpen ? "Done" : "Edit"}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleVisible}
              aria-label={section.visible ? "Hide section" : "Show section"}
            >
              {section.visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {section.visible
              ? "Hide — keeps the content, removes it from the page"
              : "Show on the page"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={isFirst}
              aria-label="Move section up"
            >
              <ChevronUp className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move up</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="Move section down"
            >
              <ChevronDown className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move down</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Delete section"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete this section entirely</TooltipContent>
        </Tooltip>
      </header>

      {isOpen && (
        <div className="space-y-5 p-4">
          {Object.entries(data).map(([key, value]) => (
            <FieldEditor
              key={key}
              fieldKey={key}
              value={value}
              onChange={(next) => onChange({ ...data, [key]: next })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
