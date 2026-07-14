import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../../../utils/sendEmail.js";
import { getESTDayBoundaries, getESTDateString, getESTDateDiffInDays } from "../../../utils/date.js";

const getActivePuzzle = async (prisma, puzzleId) => {
  if (puzzleId) {
    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
    });
    if (!puzzle) {
      throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
    }
    return puzzle;
  }

  // Find today's puzzle (publishDate matches today's date in EST boundaries)
  const { start: startOfDay, end: endOfDay } = getESTDayBoundaries();

  let puzzle = await prisma.puzzle.findFirst({
    where: {
      publishDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      publishDate: "desc",
    },
  });

  if (!puzzle) {
    puzzle = await prisma.puzzle.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishDate: "desc" },
    });
  }

  if (!puzzle) {
    puzzle = await prisma.puzzle.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  if (!puzzle) {
    throw new DevBuildError(
      "No puzzles exist in the system",
      StatusCodes.NOT_FOUND,
    );
  }

  return puzzle;
};

const formatLastDrawDate = (date) => {
  if (!date) return "Never";
  const todayStr = getESTDateString(new Date());
  const drawDateStr = getESTDateString(new Date(date));

  const diffDays = getESTDateDiffInDays(todayStr, drawDateStr);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
  return drawDateStr;
};

const getStats = async (prisma, query) => {
  const { puzzleId } = query;
  const { start: startOfToday, end: endOfToday } = getESTDayBoundaries();

  // Today's Entries (all registered and guest users who made an attempt)
  const totalEntries = await prisma.puzzleAttempt.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
      isTester: false,
    },
  });

  // Check if a winner has already been drawn today in EST
  const winnerToday = await prisma.puzzleWinner.findFirst({
    where: {
      announcedAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  let eligibleEntries = 0;
  let winnerRecord = winnerToday;

  if (!winnerToday) {
    if (puzzleId) {
      const puzzle = await prisma.puzzle.findUnique({
        where: { id: puzzleId },
      });
      if (puzzle) {
        eligibleEntries = puzzle.winnerSelected
          ? 0
          : await prisma.puzzleAttempt.count({
              where: {
                puzzleId: puzzle.id,
                completed: true,
                isTester: false,
                winner: null,
                status: "ELIGIBLE",
              },
            });

        winnerRecord = await prisma.puzzleWinner.findFirst({
          where: {
            puzzleId: puzzle.id,
            winnerType: "PUZZLE",
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });
      }
    } else {
      // Count all eligible attempts across all published puzzles that are pending draw
      eligibleEntries = await prisma.puzzleAttempt.count({
        where: {
          completed: true,
          isTester: false,
          status: "ELIGIBLE",
          puzzle: {
            status: "PUBLISHED",
            winnerSelected: false,
          },
        },
      });
    }
  }

  // Last Draw Date across all puzzles
  const lastWinner = await prisma.puzzleWinner.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    stats: {
      todayEntries: totalEntries,
      eligibleEntries: eligibleEntries,
      currentWinner: winnerRecord ? winnerRecord.user.name : "Pending",
      lastDrawDate: formatLastDrawDate(
        lastWinner?.announcedAt || lastWinner?.createdAt,
      ),
    },
    winnerDetails: winnerRecord
      ? {
          id: winnerRecord.id,
          name: winnerRecord.user.name,
          email: winnerRecord.user.email,
          announcedAt: winnerRecord.announcedAt,
          selectionType: winnerRecord.selectionType,
        }
      : null,
  };
};

const getEligibleEntries = async (prisma, query) => {
  const { puzzleId, type, search, page = 1, limit = 10 } = query;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // Fetch dashboard statistics for the puzzle
  const statsData = await getStats(prisma, query);

  // If a winner has already been drawn today in EST, no more draws can be done, so 0 eligible entries
  const { start: startOfToday, end: endOfToday } = getESTDayBoundaries();
  const winnerToday = await prisma.puzzleWinner.findFirst({
    where: {
      announcedAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  if (winnerToday) {
    return {
      meta: {
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
        totalPage: 0,
      },
      data: [],
      stats: statsData.stats,
      winnerDetails: statsData.winnerDetails,
    };
  }

  const where = {
    isTester: false,
    status: "ELIGIBLE",
    AND: [],
  };

  if (puzzleId) {
    where.puzzleId = puzzleId;
  } else {
    // Show attempts for all published puzzles where draw is pending
    where.puzzle = {
      status: "PUBLISHED",
      winnerSelected: false,
    };
  }

  if (type === "PUZZLE") {
    where.completed = true;
  } else if (type === "ALTERNATE") {
    where.completed = false;
  }

  if (search) {
    where.AND.push({
      OR: [
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (where.AND.length === 0) {
    delete where.AND;
  }

  const [attempts, total] = await Promise.all([
    prisma.puzzleAttempt.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: parsedLimit,
    }),
    prisma.puzzleAttempt.count({ where }),
  ]);

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => String(num).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const mappedData = attempts.map((item) => ({
    id: item.id,
    displayId: item.displayId || `ENT-${item.id.slice(-4).toUpperCase()}`,
    participant: {
      id: item.user?.id || null,
      name: item.user?.name || item.name || "N/A",
      email: item.user?.email || item.email || "N/A",
      phone: item.phone || null,
    },
    type: item.completed ? "Puzzle" : "Alternate",
    solveTime: item.completed ? formatDuration(item.durationSeconds) : "-",
    date: getESTDateString(item.createdAt),
  }));

  const meta = {
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPage: Math.ceil(total / parsedLimit),
  };

  return {
    meta,
    data: mappedData,
    stats: statsData.stats,
    winnerDetails: statsData.winnerDetails,
  };
};

const drawRandomWinner = async (prisma, payload) => {
  // Enforce one winner select per day in EST boundaries
  const { start: startOfToday, end: endOfToday } = getESTDayBoundaries();

  const existingWinnerToday = await prisma.puzzleWinner.findFirst({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  if (existingWinnerToday) {
    throw new DevBuildError(
      "A winner has already been selected today. You can only select one winner per day.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const { attemptId } = payload;

  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
    include: { winner: true },
  });

  if (!attempt) {
    throw new DevBuildError("Attempt not found", StatusCodes.NOT_FOUND);
  }

  const puzzleId = attempt.puzzleId;

  if (attempt.status !== "ELIGIBLE") {
    throw new DevBuildError(
      "This entry is not eligible (already a winner or disqualified)",
      StatusCodes.BAD_REQUEST,
    );
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const targetWinnerType = attempt.completed ? "PUZZLE" : "ALTERNATE";

  const winner = await prisma.$transaction(async (tx) => {
    let winnerUserId = attempt.userId;

    if (!winnerUserId) {
      if (!attempt.email) {
        throw new DevBuildError(
          "Cannot select this attempt as winner because it has no email address",
          StatusCodes.BAD_REQUEST,
        );
      }

      let user = await tx.user.findUnique({
        where: { email: attempt.email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 12);
        user = await tx.user.create({
          data: {
            name: attempt.name || "Guest Player",
            email: attempt.email,
            password: hashedPassword,
            role: "USER",
            isActive: true,
            isVerified: true,
          },
        });
      }

      winnerUserId = user.id;

      await tx.puzzleAttempt.update({
        where: { id: attempt.id },
        data: { userId: winnerUserId },
      });
    }

    // Check if the user is already a winner of this puzzle (to enforce unique constraint manually just in case)
    const alreadyWon = await tx.puzzleWinner.findUnique({
      where: {
        puzzleId_userId: {
          puzzleId,
          userId: winnerUserId,
        },
      },
    });

    if (alreadyWon) {
      throw new DevBuildError(
        "This user is already a winner for this puzzle.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const createdWinner = await tx.puzzleWinner.create({
      data: {
        puzzleId,
        userId: winnerUserId,
        attemptId: attempt.id,
        winnerType: targetWinnerType,
        selectionType: "RANDOM",
        status: "PENDING",
        reward: puzzle.dailyPrize || "Daily Prize",
        announcedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (targetWinnerType === "PUZZLE") {
      await tx.puzzle.update({
        where: { id: puzzleId },
        data: {
          winnerSelected: true,
          winnerSelectedAt: new Date(),
        },
      });
    }

    await tx.puzzleAttempt.update({
      where: { id: attempt.id },
      data: { status: "WINNER" },
    });

    return createdWinner;
  });

  // Asynchronously send congratulations email
  sendEmail({
    to: winner.user.email,
    subject: "Congratulations! You won the Daily Crossword Puzzle!",
    templateName: "winnerNotification",
    templateData: {
      name: winner.user.name || "Winner",
      prize: winner.reward || "Daily Prize",
    },
    senderType: "giveaway",
  }).catch((err) => {
    console.error("Failed to send winner email notification:", err);
  });

  return winner;
};

const drawManualWinner = async (prisma, payload) => {
  // Enforce one winner select per day in EST boundaries
  const { start: startOfToday, end: endOfToday } = getESTDayBoundaries();

  const existingWinnerToday = await prisma.puzzleWinner.findFirst({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  if (existingWinnerToday) {
    throw new DevBuildError(
      "A winner has already been selected today. You can only select one winner per day.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const { attemptId } = payload;

  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
    include: { winner: true },
  });

  if (!attempt) {
    throw new DevBuildError("Attempt not found", StatusCodes.NOT_FOUND);
  }

  const puzzleId = attempt.puzzleId;

  if (attempt.status !== "ELIGIBLE") {
    throw new DevBuildError(
      "This entry is not eligible (already a winner or disqualified)",
      StatusCodes.BAD_REQUEST,
    );
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const targetWinnerType = attempt.completed ? "PUZZLE" : "ALTERNATE";

  const winner = await prisma.$transaction(async (tx) => {
    let winnerUserId = attempt.userId;

    if (!winnerUserId) {
      if (!attempt.email) {
        throw new DevBuildError(
          "Cannot select this attempt as winner because it has no email address",
          StatusCodes.BAD_REQUEST,
        );
      }

      let user = await tx.user.findUnique({
        where: { email: attempt.email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 12);
        user = await tx.user.create({
          data: {
            name: attempt.name || "Guest Player",
            email: attempt.email,
            password: hashedPassword,
            role: "USER",
            isActive: true,
            isVerified: true,
          },
        });
      }

      winnerUserId = user.id;

      await tx.puzzleAttempt.update({
        where: { id: attempt.id },
        data: { userId: winnerUserId },
      });
    }

    const alreadyWon = await tx.puzzleWinner.findUnique({
      where: {
        puzzleId_userId: {
          puzzleId,
          userId: winnerUserId,
        },
      },
    });

    if (alreadyWon) {
      throw new DevBuildError(
        "This user is already a winner for this puzzle.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const createdWinner = await tx.puzzleWinner.create({
      data: {
        puzzleId,
        userId: winnerUserId,
        attemptId: attempt.id,
        winnerType: targetWinnerType,
        selectionType: "MANUAL",
        status: "PENDING",
        reward: puzzle.dailyPrize || "Daily Prize",
        announcedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (targetWinnerType === "PUZZLE") {
      await tx.puzzle.update({
        where: { id: puzzleId },
        data: {
          winnerSelected: true,
          winnerSelectedAt: new Date(),
        },
      });
    }

    await tx.puzzleAttempt.update({
      where: { id: attempt.id },
      data: { status: "WINNER" },
    });

    return createdWinner;
  });

  // Asynchronously send congratulations email
  sendEmail({
    to: winner.user.email,
    subject: "Congratulations! You won the Daily Crossword Puzzle!",
    templateName: "winnerNotification",
    templateData: {
      name: winner.user.name || "Winner",
      prize: winner.reward || "Daily Prize",
    },
    senderType: "giveaway",
  }).catch((err) => {
    console.error("Failed to send winner email notification:", err);
  });

  return winner;
};

export const DrawWinnerService = {
  getStats,
  getEligibleEntries,
  drawRandomWinner,
  drawManualWinner,
};
