"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * A generic editor driven by the shape of the value, rather than 12 bespoke
 * forms. Every section's `data` is made of strings, booleans, string arrays and
 * arrays of flat objects, so four cases cover all of them — and adding a
 * section type later needs no new editor code.
 *
 * Nulls are edited as empty strings. That's safe because every nullable field in
 * the schema is `string | null`, and "" is valid for both; the renderers treat
 * "" as falsy and omit the element, which is the behaviour you want anyway.
 */

/** camelCase / snake_case -> "Title Case" */
export function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Structural fields the rep must not edit — ids are referenced by other sections. */
const HIDDEN_KEYS = new Set(["id"]);

/** Keys that deserve a textarea rather than a single-line input. */
const LONG_TEXT_KEYS = new Set([
  "description",
  "answer",
  "subheadline",
  "intro",
  "footnote",
  "subheading",
  "value",
  "note",
  "caption",
]);

function isLongText(key: string, value: string): boolean {
  return LONG_TEXT_KEYS.has(key) || value.length > 90;
}

type Primitive = string | number | boolean | null;

function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isStringArray(value: unknown[]): boolean {
  return value.every((item) => typeof item === "string");
}

/** Blank item for "+ Add", cloned from a sibling so the shape always matches. */
function blankLike(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (typeof template === "number") return 0;
  if (typeof template === "boolean") return false;
  if (template === null) return "";
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(template)) {
      // Fresh id so deleting the original doesn't orphan references.
      out[key] =
        key === "id"
          ? `new-${Math.random().toString(36).slice(2, 8)}`
          : blankLike(value);
    }
    return out;
  }
  return "";
}

export function FieldEditor({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  if (HIDDEN_KEYS.has(fieldKey)) return null;

  const label = humanizeKey(fieldKey);

  // Boolean -> checkbox
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded border-input accent-primary"
        />
        <span className="font-medium">{label}</span>
      </label>
    );
  }

  // String / number / null -> input or textarea
  if (isPrimitive(value)) {
    const asText = value === null ? "" : String(value);
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </Label>
        {isLongText(fieldKey, asText) ? (
          <Textarea
            rows={3}
            value={asText}
            onChange={(event) => onChange(event.target.value)}
            className="resize-y"
          />
        ) : (
          <Input
            value={asText}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    // Array of strings -> bullet list with add/remove
    if (isStringArray(value)) {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            {label}
          </Label>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  rows={2}
                  value={item as string}
                  onChange={(event) => {
                    const next = [...value];
                    next[index] = event.target.value;
                    onChange(next);
                  }}
                  className="resize-y"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${label} item ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...value, ""])}
          >
            <Plus className="size-3.5" />
            Add {label.toLowerCase()}
          </Button>
        </div>
      );
    }

    // Array of objects -> card per item, with add/remove
    return (
      <div className="space-y-3">
        <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label} ({value.length})
        </Label>

        {value.map((item, index) => (
          <div key={index} className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>

            <div className="space-y-4">
              {Object.entries(item as Record<string, unknown>).map(
                ([childKey, childValue]) => (
                  <FieldEditor
                    key={childKey}
                    fieldKey={childKey}
                    value={childValue}
                    onChange={(next) => {
                      const nextArray = [...value];
                      nextArray[index] = {
                        ...(item as Record<string, unknown>),
                        [childKey]: next,
                      };
                      onChange(nextArray);
                    }}
                  />
                ),
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.length === 0}
          title={
            value.length === 0
              ? "Nothing left to copy a shape from — hide the section instead"
              : undefined
          }
          onClick={() => onChange([...value, blankLike(value[0])])}
        >
          <Plus className="size-3.5" />
          Add {label.toLowerCase().replace(/\s*\(\d+\)$/, "")}
        </Button>
      </div>
    );
  }

  // Nested object (e.g. a CTA's label + href)
  if (value && typeof value === "object") {
    return (
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </legend>
        {Object.entries(value as Record<string, unknown>).map(
          ([childKey, childValue]) => (
            <FieldEditor
              key={childKey}
              fieldKey={childKey}
              value={childValue}
              onChange={(next) =>
                onChange({
                  ...(value as Record<string, unknown>),
                  [childKey]: next,
                })
              }
            />
          ),
        )}
      </fieldset>
    );
  }

  return null;
}
