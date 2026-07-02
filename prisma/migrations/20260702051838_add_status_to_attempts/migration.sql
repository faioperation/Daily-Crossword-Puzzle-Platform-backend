-- CreateEnum
CREATE TYPE "EntriesType" AS ENUM ('ELIGIBLE', 'DISQUALIFIED', 'WINNER');

-- AlterTable
ALTER TABLE "puzzle_attempts" ADD COLUMN     "status" "EntriesType" NOT NULL DEFAULT 'ELIGIBLE';
