/*
  Warnings:

  - The values [ANNOUNCED] on the enum `WinnerStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WinnerStatus_new" AS ENUM ('PENDING', 'CLAIMED');
UPDATE "puzzle_winners" SET "status" = 'PENDING' WHERE "status"::text = 'ANNOUNCED';
ALTER TABLE "public"."puzzle_winners" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "puzzle_winners" ALTER COLUMN "status" TYPE "WinnerStatus_new" USING ("status"::text::"WinnerStatus_new");
ALTER TYPE "WinnerStatus" RENAME TO "WinnerStatus_old";
ALTER TYPE "WinnerStatus_new" RENAME TO "WinnerStatus";
DROP TYPE "public"."WinnerStatus_old";
ALTER TABLE "puzzle_winners" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
