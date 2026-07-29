import type { Metadata } from "next";
import { ProposalRenderer } from "@/components/proposal/proposal-renderer";
import { DEFAULT_PROPOSAL } from "@/server/proposal/default-proposal";

export const metadata: Metadata = {
  title: "Proposal template preview",
  // `robots` comes from the root layout; declaring it here would replace it.
};

/**
 * Design route. Renders the default proposal through the real renderer, so the
 * template can be reviewed without a database or a generated proposal.
 * The public page at /lp/[slug] will render the exact same component.
 */
export default function ProposalPreviewPage() {
  return <ProposalRenderer content={DEFAULT_PROPOSAL} />;
}
