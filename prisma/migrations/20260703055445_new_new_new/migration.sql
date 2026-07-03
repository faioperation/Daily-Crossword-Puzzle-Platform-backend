/*
  Warnings:

  - A unique constraint covering the columns `[displayId]` on the table `puzzle_attempts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "puzzle_attempts" ADD COLUMN     "displayId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_attempts_displayId_key" ON "puzzle_attempts"("displayId");
