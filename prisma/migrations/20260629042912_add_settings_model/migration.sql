/*
  Warnings:

  - You are about to drop the `announcements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blocked_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `puzzle_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `puzzle_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `puzzle_clues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `puzzle_winners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tester_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_statistics` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `puzzle_cells` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_createdById_fkey";

-- DropForeignKey
ALTER TABLE "blocked_devices" DROP CONSTRAINT "blocked_devices_blockedById_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_answers" DROP CONSTRAINT "puzzle_answers_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_attempts" DROP CONSTRAINT "puzzle_attempts_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_attempts" DROP CONSTRAINT "puzzle_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_clues" DROP CONSTRAINT "puzzle_clues_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_winners" DROP CONSTRAINT "puzzle_winners_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_winners" DROP CONSTRAINT "puzzle_winners_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "puzzle_winners" DROP CONSTRAINT "puzzle_winners_userId_fkey";

-- DropForeignKey
ALTER TABLE "tester_devices" DROP CONSTRAINT "tester_devices_createdById_fkey";

-- DropForeignKey
ALTER TABLE "user_statistics" DROP CONSTRAINT "user_statistics_userId_fkey";

-- AlterTable
ALTER TABLE "puzzle_cells" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "puzzles" ADD COLUMN     "dailyPrize" TEXT;

-- DropTable
DROP TABLE "announcements";

-- DropTable
DROP TABLE "blocked_devices";

-- DropTable
DROP TABLE "puzzle_answers";

-- DropTable
DROP TABLE "puzzle_attempts";

-- DropTable
DROP TABLE "puzzle_clues";

-- DropTable
DROP TABLE "puzzle_winners";

-- DropTable
DROP TABLE "tester_devices";

-- DropTable
DROP TABLE "user_statistics";

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL DEFAULT 'Daily Crossword Platform',
    "logo" TEXT,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@crossword.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
