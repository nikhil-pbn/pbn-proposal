import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SECTION_LABELS, type ProposalSection } from "@/types/proposal";

/** Sections worth putting in the jump nav. Hero and CTA are reachable by scroll. */
const NAV_SECTIONS = new Set([
  "problems",
  "solutions",
  "comparison",
  "pricing",
  "timeline",
  "faq",
]);

export function ProposalNav({
  practiceName,
  sections,
}: {
  practiceName: string;
  sections: ProposalSection[];
}) {
  const links = sections.filter((section) => NAV_SECTIONS.has(section.type));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground"
          >
            PbN
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {practiceName}
          </span>
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((section) => (
            <Button key={section.id} asChild variant="ghost" size="sm">
              <Link href={`#${section.id}`}>{SECTION_LABELS[section.type]}</Link>
            </Button>
          ))}
        </nav>

        <Button asChild size="sm" className="ml-auto lg:ml-0">
          <Link href="#next-steps">Book a call</Link>
        </Button>
      </div>
    </header>
  );
}
