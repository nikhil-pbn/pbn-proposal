import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "./section-shell";
import type { ProblemsData, SolutionsData } from "@/types/proposal";

export function SolutionsSection({
  id,
  data,
  problems,
}: {
  id: string;
  data: SolutionsData;
  /** Used to label the "solves" chips. Absent if the problems section was deleted. */
  problems?: ProblemsData;
}) {
  const problemTitleById = new Map(
    (problems?.items ?? []).map((problem) => [problem.id, problem.title]),
  );

  return (
    <SectionShell
      id={id}
      tone="muted"
      eyebrow="The recommendation"
      heading={data.heading}
      intro={data.intro}
    >
      <div className="space-y-5">
        {data.items.map((item) => {
          const solves = item.solvesProblemIds
            .map((problemId) => problemTitleById.get(problemId))
            .filter((title): title is string => Boolean(title));

          return (
            <article
              key={item.id}
              className="rounded-xl border bg-card p-6 shadow-xs sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-brand-accent-muted text-brand-accent hover:bg-brand-accent-muted">
                  {item.module}
                </Badge>
                {solves.map((title) => (
                  <span
                    key={title}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    solves &ldquo;{title}&rdquo;
                  </span>
                ))}
              </div>

              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              {item.bullets.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {item.bullets.map((bullet, index) => (
                    <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-success"
                        aria-hidden
                      />
                      <span className="text-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
