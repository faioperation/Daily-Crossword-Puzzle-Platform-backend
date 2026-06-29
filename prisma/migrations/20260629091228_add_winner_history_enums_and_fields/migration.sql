-- CreateEnum
CREATE TYPE "WinnerType" AS ENUM ('PUZZLE', 'ALTERNATE');

-- CreateEnum
CREATE TYPE "SelectionType" AS ENUM ('MANUAL', 'RANDOM');

-- AlterTable
ALTER TABLE "puzzle_winners" ADD COLUMN     "selectionType" "SelectionType" NOT NULL DEFAULT 'RANDOM',
ADD COLUMN     "winnerType" "WinnerType" NOT NULL DEFAULT 'PUZZLE';

-- CreateIndex
CREATE INDEX "puzzle_winners_winnerType_idx" ON "puzzle_winners"("winnerType");

-- CreateIndex
CREATE INDEX "puzzle_winners_selectionType_idx" ON "puzzle_winners"("selectionType");
