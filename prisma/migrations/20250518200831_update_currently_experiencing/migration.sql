/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `CurrentlyExperiencing` table. All the data in the column will be lost.
  - Added the required column `creator` to the `CurrentlyExperiencing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrentlyExperiencing" DROP COLUMN "imageUrl",
ADD COLUMN     "creator" TEXT NOT NULL;
