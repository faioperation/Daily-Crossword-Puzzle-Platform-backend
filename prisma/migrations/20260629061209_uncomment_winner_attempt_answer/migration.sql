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
