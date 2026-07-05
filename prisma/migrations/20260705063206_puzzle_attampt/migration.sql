/*
  Warnings:

  - You are about to drop the column `column` on the `puzzle_answers` table. All the data in the column will be lost.
  - You are about to drop the column `enteredLetter` on the `puzzle_answers` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `puzzle_answers` table. All the data in the column will be lost.
  - You are about to drop the column `row` on the `puzzle_answers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attemptId]` on the table `puzzle_answers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "puzzle_answers_attemptId_idx";

-- DropIndex
DROP INDEX "puzzle_answers_attemptId_row_column_key";

-- AlterTable
ALTER TABLE "puzzle_answers" DROP COLUMN "column",
DROP COLUMN "enteredLetter",
DROP COLUMN "isCorrect",
DROP COLUMN "row",
ADD COLUMN     "answers" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "puzzle_attempts" ADD COLUMN     "date" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_answers_attemptId_key" ON "puzzle_answers"("attemptId");
