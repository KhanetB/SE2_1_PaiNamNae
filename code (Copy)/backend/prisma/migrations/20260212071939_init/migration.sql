/*
  Warnings:

  - Added the required column `deletedBy` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
