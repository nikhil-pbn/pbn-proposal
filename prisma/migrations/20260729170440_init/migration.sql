-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('Draft', 'Published');

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "rep_name" VARCHAR(255) NOT NULL,
    "rep_email" VARCHAR(255) NOT NULL,
    "practice_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(255) NOT NULL,
    "transcript" TEXT NOT NULL,
    "proposal_json" JSONB NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'Draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_tracking" (
    "id" UUID NOT NULL,
    "ae_name" VARCHAR(255) NOT NULL,
    "practice_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(255) NOT NULL,
    "proposal_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_slug_key" ON "proposals"("slug");

-- CreateIndex
CREATE INDEX "proposals_status_created_at_idx" ON "proposals"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "proposal_tracking_created_at_idx" ON "proposal_tracking"("created_at" DESC);

-- CreateIndex
CREATE INDEX "proposal_tracking_ae_name_idx" ON "proposal_tracking"("ae_name");
