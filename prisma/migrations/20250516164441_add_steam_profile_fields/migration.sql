/*
  Warnings:

  - A unique constraint covering the columns `[favoriteReviewId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "favoriteReviewId" INTEGER,
ADD COLUMN     "recentActivity" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "User_favoriteReviewId_key" ON "User"("favoriteReviewId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteReviewId_fkey" FOREIGN KEY ("favoriteReviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
