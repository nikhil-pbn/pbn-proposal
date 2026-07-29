import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionShell } from "./section-shell";
import type { ComparisonData } from "@/types/proposal";

export function ComparisonSection({
  id,
  data,
}: {
  id: string;
  data: ComparisonData;
}) {
  return (
    <SectionShell
      id={id}
      eyebrow="Side by side"
      heading={data.heading}
      intro={data.intro}
    >
      {/* Wide content scrolls in its own container; the page never scrolls sideways. */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[34%] min-w-40">Capability</TableHead>
              <TableHead className="w-[33%] min-w-44">
                {data.currentLabel}
              </TableHead>
              <TableHead className="w-[33%] min-w-44 bg-brand-muted font-semibold text-brand">
                {data.pbnLabel}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">
                  {row.capability}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.current}
                </TableCell>
                <TableCell className="bg-brand-muted/60 font-medium text-foreground">
                  {row.pbn}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionShell>
  );
}
