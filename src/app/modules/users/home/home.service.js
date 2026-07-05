import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import crypto from "crypto";

const getActivePuzzle = async (prisma, userId) => {
  // 1. Find today's puzzle (publishDate matches today's date in UTC boundaries)
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

  let puzzle = await prisma.puzzle.findFirst({
    where: {
      status: "PUBLISHED",
      publishDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      publishDate: "desc",
    },
  });

  // Fallback to the latest published puzzle overall if none published today
  if (!puzzle) {
    puzzle = await prisma.puzzle.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishDate: "desc" },
    });
  }

  if (!puzzle) {
    throw new DevBuildError(
      "No active puzzle available today.",
      StatusCodes.NOT_FOUND,
    );
  }

  // 2. Fetch the user's attempt for this puzzle if a userId is provided
  const attempt = userId
    ? await prisma.puzzleAttempt.findFirst({
        where: {
          puzzleId: puzzle.id,
          userId: userId,
        },
        include: {
          winner: true,
          answers: true,
        },
      })
    : null;

  let responseCells = puzzle.cells;
  let responseClues = puzzle.clues;

  return {
    puzzle: {
      id: puzzle.id,
      title: puzzle.title,
      description: puzzle.description,
      rows: puzzle.rows,
      columns: puzzle.columns,
      rules: puzzle.rules,
      difficulty: puzzle.difficulty,
      dailyPrize: puzzle.dailyPrize,
      winnerSelected: puzzle.winnerSelected,
      cells: responseCells,
      clues: responseClues,
    },
    attempt: attempt
      ? {
          id: attempt.id,
          displayId: attempt.displayId,
          completed: attempt.completed,
          score: attempt.score,
          wrongAttempts: attempt.wrongAttempts,
          hintsUsed: attempt.hintsUsed,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          durationSeconds: attempt.durationSeconds,
          status: attempt.status,
          hasWon: !!attempt.winner,
          answers: attempt.answers ? attempt.answers.answers : null,
        }
      : null,
  };
};

const submitAttempt = async (prisma, userId, payload, devicePayload = {}) => {
  const { name, email, phone, date, type, durationSeconds } = payload;
  const { deviceId, fingerprint, ipAddress, userAgent, browser, os } = devicePayload;

  // 1. Resolve today's active puzzle
  const activePuzzleData = await getActivePuzzle(prisma, null);
  const puzzleId = activePuzzleData.puzzle.id;

  const attemptId = crypto.randomUUID();
  const displayId = `ENT-${attemptId.slice(-4).toUpperCase()}`;

  const isCompleted = type?.toUpperCase() === "PUZZLE";
  const completedAt = new Date();
  const startedAt = new Date(completedAt.getTime() - (durationSeconds || 0) * 1000);

  const attempt = await prisma.puzzleAttempt.create({
    data: {
      id: attemptId,
      displayId,
      puzzleId: puzzleId,
      userId: userId || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      date: date || null,
      type: type || null,
      deviceId: deviceId || "unknown",
      fingerprint: fingerprint || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      browser: browser || null,
      os: os || null,
      playDate: completedAt,
      startedAt: startedAt,
      completedAt: isCompleted ? completedAt : null,
      durationSeconds: durationSeconds || 0,
      completed: isCompleted,
      score: 100, // Default perfect score since we're not checking wrong attempts server-side
      status: "ELIGIBLE",
    },
  });

  return {
    success: true,
    message: isCompleted
      ? "Congratulations! You successfully solved the puzzle!"
      : "Attempt recorded successfully!",
    attempt,
  };
};

export const HomeService = {
  getActivePuzzle,
  submitAttempt,
};
