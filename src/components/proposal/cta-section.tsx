import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CtaSectionData } from "@/types/proposal";

export function CtaSection({
  id,
  data,
}: {
  id: string;
  data: CtaSectionData;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 bg-primary px-6 py-20 text-primary-foreground sm:py-24"
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {data.heading}
        </h2>
        {data.subheading && (
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            {data.subheading}
          </p>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
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

        {(data.contactName || data.contactEmail || data.contactPhone) && (
          <div className="mt-12 border-t border-primary-foreground/15 pt-8">
            {data.contactName && (
              <p className="font-medium">{data.contactName}</p>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/75">
              {data.contactEmail && (
                <a
                  href={`mailto:${data.contactEmail}`}
                  className="inline-flex items-center gap-2 hover:text-primary-foreground"
                >
                  <Mail className="size-3.5" aria-hidden />
                  {data.contactEmail}
                </a>
              )}
              {data.contactPhone && (
                <a
                  href={`tel:${data.contactPhone}`}
                  className="inline-flex items-center gap-2 hover:text-primary-foreground"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {data.contactPhone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
