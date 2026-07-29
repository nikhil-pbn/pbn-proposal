/**
 * The only module app code should import for database access. Keeps the
 * generated-client path (src/generated/prisma) an implementation detail, so
 * regenerating or relocating it doesn't ripple through the codebase.
 */
export { prisma } from "./client";
export { ProposalStatus } from "@/generated/prisma/enums";
export type { Proposal, ProposalTracking } from "@/generated/prisma/client";
