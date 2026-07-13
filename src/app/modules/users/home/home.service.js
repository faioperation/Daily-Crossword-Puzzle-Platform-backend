import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import crypto from "crypto";
import { sendEmail } from "../../../utils/sendEmail.js";
import { getESTDateString, getESTDateDiffInDays, getESTDayBoundaries } from "../../../utils/date.js";

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

  let currentStreak = 0;
  let longestStreak = 0;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastSolvedDate: true,
      },
    });

    if (user) {
      currentStreak = user.currentStreak;
      longestStreak = user.longestStreak;

      if (user.lastSolvedDate) {
        const todayStr = getESTDateString(new Date());
        const lastSolvedStr = getESTDateString(user.lastSolvedDate);
        const diff = getESTDateDiffInDays(todayStr, lastSolvedStr);

        // If the user didn't solve a puzzle yesterday or today, their streak is broken
        if (diff > 1) {
          currentStreak = 0;
          await prisma.user.update({
            where: { id: userId },
            data: { currentStreak: 0 },
          });
        }
      }
    }
  }

  return {
    puzzle: {
      id: puzzle.id,
      title: puzzle.title,
      description: puzzle.description,
      image: puzzle.image,
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
    streak: userId
      ? {
          currentStreak,
          longestStreak,
        }
      : null,
  };
};

const submitAttempt = async (prisma, userId, payload, devicePayload = {}) => {
  const { name, email, phone, date, type, durationSeconds } = payload;
  const { deviceId, fingerprint, ipAddress, userAgent, browser, os } =
    devicePayload;

  // 1. Enforce one submission per email per calendar day (USA Eastern Time)
  const { start: estStart, end: estEnd } = getESTDayBoundaries();

  const existingAttempt = await prisma.puzzleAttempt.findFirst({
    where: {
      playDate: {
        gte: estStart,
        lte: estEnd,
      },
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        {
          user: {
            email: { equals: email, mode: "insensitive" },
          },
        },
      ],
    },
  });

  if (existingAttempt) {
    throw new DevBuildError(
      "You have already submitted a crossword entry with this email address today. Please try again tomorrow.",
      StatusCodes.BAD_REQUEST,
    );
  }

  // 2. Resolve today's active puzzle
  const activePuzzleData = await getActivePuzzle(prisma, null);
  const puzzleId = activePuzzleData.puzzle.id;

  const attemptId = crypto.randomUUID();
  const displayId = `ENT-${attemptId.slice(-4).toUpperCase()}`;

  const isCompleted = type?.toUpperCase() === "PUZZLE";
  const completedAt = new Date();
  const startedAt = new Date(
    completedAt.getTime() - (durationSeconds || 0) * 1000,
  );

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

  // Update user streak if logged in and puzzle is successfully completed
  if (userId && isCompleted) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          currentStreak: true,
          longestStreak: true,
          lastSolvedDate: true,
        },
      });

      if (user) {
        const todayStr = getESTDateString(new Date());
        let nextStreak = user.currentStreak;
        let nextLongest = user.longestStreak;
        let shouldUpdateUser = false;

        if (!user.lastSolvedDate) {
          nextStreak = 1;
          shouldUpdateUser = true;
        } else {
          const lastSolvedStr = getESTDateString(user.lastSolvedDate);
          const diff = getESTDateDiffInDays(todayStr, lastSolvedStr);

          if (diff === 1) {
            nextStreak += 1;
            shouldUpdateUser = true;
          } else if (diff > 1) {
            nextStreak = 1;
            shouldUpdateUser = true;
          }
        }

        if (shouldUpdateUser) {
          if (nextStreak > nextLongest) {
            nextLongest = nextStreak;
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              currentStreak: nextStreak,
              longestStreak: nextLongest,
              lastSolvedDate: new Date(),
            },
          });
        }
      }
    } catch (streakError) {
      console.error("Failed to update user streak:", streakError);
    }
  }

  if (isCompleted && email) {
    const minutes = Math.floor((durationSeconds || 0) / 60);
    const seconds = (durationSeconds || 0) % 60;
    const solveTimeStr =
      minutes > 0
        ? `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`
        : `${seconds} second${seconds !== 1 ? "s" : ""}`;

    sendEmail({
      to: email,
      subject: "Well Done! You Completed Today's Crossword",
      templateName: "puzzleCompletion",
      templateData: {
        name: name || "Player",
        puzzleTitle: activePuzzleData.puzzle.title,
        solveTime: solveTimeStr,
        prize: activePuzzleData.puzzle.dailyPrize || "N/A",
      },
      senderType: "giveaway",
    }).catch((err) => {
      console.error("Failed to send puzzle completion email:", err);
    });
  }

  return {
    success: true,
    message: isCompleted
      ? "Congratulations! You successfully solved the puzzle!"
      : "Attempt recorded successfully!",
    attempt,
  };
};

const getRecentWinners = async (prisma) => {
  const winners = await prisma.puzzleWinner.findMany({
    take: 3,
    orderBy: {
      announcedAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      puzzle: {
        select: {
          publishDate: true,
          dailyPrize: true,
        },
      },
    },
  });

  return winners.map((w) => {
    const rawDate = w.announcedAt || w.createdAt;
    const month = rawDate.getMonth() + 1;
    const day = rawDate.getDate();
    const year = rawDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    return {
      id: w.id,
      date: formattedDate,
      winnerName: w.user?.name || "N/A",
      prize: w.reward || w.puzzle?.dailyPrize || "N/A",
    };
  });
};

export const HomeService = {
  getActivePuzzle,
  submitAttempt,
  getRecentWinners,
};
