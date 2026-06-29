/*
  Warnings:

  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_OWNER', 'USER');

-- CreateEnum
CREATE TYPE "PuzzleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PuzzleDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ClueDirection" AS ENUM ('ACROSS', 'DOWN');

-- CreateEnum
CREATE TYPE "WinnerStatus" AS ENUM ('PENDING', 'ANNOUNCED', 'CLAIMED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "country",
DROP COLUMN "first_name",
DROP COLUMN "gender",
DROP COLUMN "is_verified",
DROP COLUMN "last_name",
DROP COLUMN "phone",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "user_role";

-- CreateTable
CREATE TABLE "puzzles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rows" INTEGER NOT NULL,
    "columns" INTEGER NOT NULL,
    "rules" TEXT,
    "difficulty" "PuzzleDifficulty" NOT NULL,
    "status" "PuzzleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishDate" TIMESTAMP(3),
    "winnerSelected" BOOLEAN NOT NULL DEFAULT false,
    "winnerSelectedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puzzles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_cells" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "number" INTEGER,
    "isBlack" BOOLEAN NOT NULL DEFAULT false,
    "letter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_clues" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "direction" "ClueDirection" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "startRow" INTEGER NOT NULL,
    "startColumn" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_clues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_attempts" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT NOT NULL,
    "fingerprint" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "playDate" TIMESTAMP(3) NOT NULL,
    "isTester" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puzzle_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "enteredLetter" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puzzle_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_winners" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "status" "WinnerStatus" NOT NULL DEFAULT 'PENDING',
    "reward" TEXT,
    "announcedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_statistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPlayed" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "fastestTime" INTEGER,
    "averageTime" DOUBLE PRECISION,
    "totalWrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalHintsUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tester_devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "fingerprint" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tester_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "fingerprint" TEXT,
    "ipAddress" TEXT,
    "reason" TEXT,
    "blockedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "puzzles_status_idx" ON "puzzles"("status");

-- CreateIndex
CREATE INDEX "puzzles_publishDate_idx" ON "puzzles"("publishDate");

-- CreateIndex
CREATE INDEX "puzzles_difficulty_idx" ON "puzzles"("difficulty");

-- CreateIndex
CREATE INDEX "puzzle_cells_puzzleId_idx" ON "puzzle_cells"("puzzleId");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_cells_puzzleId_row_column_key" ON "puzzle_cells"("puzzleId", "row", "column");

-- CreateIndex
CREATE INDEX "puzzle_clues_puzzleId_idx" ON "puzzle_clues"("puzzleId");

-- CreateIndex
CREATE INDEX "puzzle_clues_direction_idx" ON "puzzle_clues"("direction");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_clues_puzzleId_number_direction_key" ON "puzzle_clues"("puzzleId", "number", "direction");

-- CreateIndex
CREATE INDEX "puzzle_attempts_puzzleId_idx" ON "puzzle_attempts"("puzzleId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_userId_idx" ON "puzzle_attempts"("userId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_playDate_idx" ON "puzzle_attempts"("playDate");

-- CreateIndex
CREATE INDEX "puzzle_attempts_deviceId_idx" ON "puzzle_attempts"("deviceId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_fingerprint_idx" ON "puzzle_attempts"("fingerprint");

-- CreateIndex
CREATE INDEX "puzzle_attempts_completed_idx" ON "puzzle_attempts"("completed");

-- CreateIndex
CREATE INDEX "puzzle_attempts_isTester_idx" ON "puzzle_attempts"("isTester");

-- CreateIndex
CREATE INDEX "puzzle_answers_attemptId_idx" ON "puzzle_answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_answers_attemptId_row_column_key" ON "puzzle_answers"("attemptId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_winners_attemptId_key" ON "puzzle_winners"("attemptId");

-- CreateIndex
CREATE INDEX "puzzle_winners_status_idx" ON "puzzle_winners"("status");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_winners_puzzleId_userId_key" ON "puzzle_winners"("puzzleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_statistics_userId_key" ON "user_statistics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tester_devices_deviceId_key" ON "tester_devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "tester_devices_fingerprint_key" ON "tester_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "tester_devices_isActive_idx" ON "tester_devices"("isActive");

-- CreateIndex
CREATE INDEX "blocked_devices_deviceId_idx" ON "blocked_devices"("deviceId");

-- CreateIndex
CREATE INDEX "blocked_devices_fingerprint_idx" ON "blocked_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "blocked_devices_ipAddress_idx" ON "blocked_devices"("ipAddress");

-- CreateIndex
CREATE INDEX "announcements_isActive_idx" ON "announcements"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "puzzles" ADD CONSTRAINT "puzzles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_cells" ADD CONSTRAINT "puzzle_cells_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_clues" ADD CONSTRAINT "puzzle_clues_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_answers" ADD CONSTRAINT "puzzle_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "puzzle_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_winners" ADD CONSTRAINT "puzzle_winners_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_winners" ADD CONSTRAINT "puzzle_winners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_winners" ADD CONSTRAINT "puzzle_winners_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "puzzle_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_statistics" ADD CONSTRAINT "user_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tester_devices" ADD CONSTRAINT "tester_devices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_devices" ADD CONSTRAINT "blocked_devices_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
