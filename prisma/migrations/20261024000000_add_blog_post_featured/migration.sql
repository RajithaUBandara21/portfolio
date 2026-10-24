-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BlogPost_contentStatus_featured_idx" ON "BlogPost"("contentStatus", "featured");
