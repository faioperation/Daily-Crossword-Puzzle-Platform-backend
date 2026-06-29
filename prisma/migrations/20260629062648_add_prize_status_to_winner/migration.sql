-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('EMAIL_SENT', 'ADDRESS_RECEIVED', 'PRIZE_SHIPPED');

-- AlterTable
ALTER TABLE "puzzle_winners" ADD COLUMN     "prizeStatus" "PrizeStatus";
