-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "category" "ProjectCategory";

-- CreateIndex
CREATE INDEX "Certification_category_idx" ON "Certification"("category");
