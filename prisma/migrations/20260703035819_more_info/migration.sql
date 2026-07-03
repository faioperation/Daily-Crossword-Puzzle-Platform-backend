/*
  Warnings:

  - You are about to drop the `puzzle_cells` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "puzzle_cells" DROP CONSTRAINT "puzzle_cells_puzzleId_fkey";

-- AlterTable
ALTER TABLE "puzzles" ADD COLUMN     "cells" JSONB,
ADD COLUMN     "clues" JSONB;

-- DropTable
DROP TABLE "puzzle_cells";
