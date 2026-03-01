/*
  Warnings:

  - You are about to drop the column `images` on the `Review` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewFileType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "images",
ADD COLUMN     "files" JSONB;
