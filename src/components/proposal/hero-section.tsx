import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroData } from "@/types/proposal";

export function HeroSection({ id, data }: { id: string; data: HeroData }) {
  return (
    <section
      id={id}
      className="relative scroll-mt-20 overflow-hidden bg-primary px-6 py-20 text-primary-foreground sm:py-28"
    >
      {/* Soft teal wash, top-right. Decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-brand-accent/20 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-5xl">
        <p className="mb-4 inline-flex items-center rounded-full border border-primary-foreground/25 px-3 py-1 text-xs font-semibold tracking-widest uppercase">
          {data.eyebrow}
        </p>

        <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {data.headline}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
          {data.subheadline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link href={data.primaryCta.href}>
              {data.primaryCta.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          {data.secondaryCta && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href={data.secondaryCta.href}>{data.secondaryCta.label}</Link>
            </Button>
          )}
        </div>

        <dl className="mt-14 grid gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium tracking-wide uppercase text-primary-foreground/60">
              Prepared for
            </dt>
            <dd className="mt-1 font-medium">{data.contactName}</dd>
            <dd className="text-sm text-primary-foreground/70">
              {data.practiceName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide uppercase text-primary-foreground/60">
              Prepared by
            </dt>
            <dd className="mt-1 font-medium">{data.preparedByName}</dd>
            <dd className="text-sm text-primary-foreground/70">
              {data.preparedByEmail}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide uppercase text-primary-foreground/60">
              Date
            </dt>
            <dd className="mt-1 font-medium">{data.preparedOn}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
