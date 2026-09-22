-- CreateTable
CREATE TABLE "food_quotas" (
    "id" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "totalAllocated" INTEGER NOT NULL,
    "givenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByStaffId" TEXT,

    CONSTRAINT "food_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_quotas_periziaDayId_idx" ON "food_quotas"("periziaDayId");

-- CreateIndex
CREATE UNIQUE INDEX "food_quotas_periziaDayId_mealType_key" ON "food_quotas"("periziaDayId", "mealType");

-- AddForeignKey
ALTER TABLE "food_quotas" ADD CONSTRAINT "food_quotas_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_quotas" ADD CONSTRAINT "food_quotas_updatedByStaffId_fkey" FOREIGN KEY ("updatedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
