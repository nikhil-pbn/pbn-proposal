import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "default" | "muted" | "brand";

const toneClasses: Record<SectionTone, string> = {
  default: "bg-background text-foreground",
  muted: "bg-brand-muted text-foreground",
  brand: "bg-primary text-primary-foreground",
};

/**
 * Every proposal section renders through this, so vertical rhythm, container
 * width and heading treatment stay identical down the whole page.
 */
export function SectionShell({
  id,
  eyebrow,
  heading,
  intro,
  tone = "default",
  className,
  children,
}: {
  id: string;
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}) {
  const onBrand = tone === "brand";

  return (
    <section
      id={id}
      className={cn("scroll-mt-20 px-6 py-16 sm:py-20", toneClasses[tone], className)}
    >
      <div className="mx-auto w-full max-w-5xl">
        {(eyebrow || heading || intro) && (
          <header className="mb-10 max-w-2xl">
            {eyebrow && (
              <p
                className={cn(
                  "mb-3 text-xs font-semibold tracking-widest uppercase",
                  onBrand ? "text-primary-foreground/70" : "text-brand-accent",
                )}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={cn(
                  "mt-4 text-lg leading-relaxed",
                  onBrand ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {intro}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
