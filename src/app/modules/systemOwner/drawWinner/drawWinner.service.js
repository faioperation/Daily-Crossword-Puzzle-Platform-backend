import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";

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

  // Find today's puzzle (publishDate matches today's date)
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

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
    throw new DevBuildError("No puzzles exist in the system", StatusCodes.NOT_FOUND);
  }

  return puzzle;
};

const formatLastDrawDate = (date) => {
  if (!date) return "Never";
  const today = new Date();
  const drawDate = new Date(date);
  
  const diffTime = today.setHours(0,0,0,0) - drawDate.setHours(0,0,0,0);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
  return drawDate.toISOString().split("T")[0];
};

const getStats = async (prisma, query) => {
  const { puzzleId } = query;
  const puzzle = await getActivePuzzle(prisma, puzzleId);

  // Today's Entries (all registered users who made an attempt)
  const totalEntries = await prisma.puzzleAttempt.count({
    where: {
      puzzleId: puzzle.id,
      userId: { not: null },
      isTester: false,
    },
  });

  // Eligible Entries (completed attempts that haven't won yet)
  const eligibleEntries = await prisma.puzzleAttempt.count({
    where: {
      puzzleId: puzzle.id,
      userId: { not: null },
      completed: true,
      isTester: false,
      winner: null,
    },
  });

  // Current Winner (primary PUZZLE winner of this puzzle)
  const winnerRecord = await prisma.puzzleWinner.findFirst({
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
      lastDrawDate: formatLastDrawDate(lastWinner?.announcedAt || lastWinner?.createdAt),
    },
    winnerDetails: winnerRecord ? {
      id: winnerRecord.id,
      name: winnerRecord.user.name,
      email: winnerRecord.user.email,
      announcedAt: winnerRecord.announcedAt,
      selectionType: winnerRecord.selectionType,
    } : null,
  };
};

const getEligibleEntries = async (prisma, query) => {
  const { puzzleId, type, search, page = 1, limit = 10 } = query;
  const puzzle = await getActivePuzzle(prisma, puzzleId);

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // Fetch dashboard statistics for the puzzle
  const statsData = await getStats(prisma, query);

  const where = {
    puzzleId: puzzle.id,
    userId: { not: null },
    isTester: false,
    status: "ELIGIBLE",
  };

  if (type === "PUZZLE") {
    where.completed = true;
  } else if (type === "ALTERNATE") {
    where.completed = false;
  }

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
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
      id: item.user.id,
      name: item.user.name,
      email: item.user.email,
    },
    type: item.completed ? "Puzzle" : "Alternate",
    solveTime: item.completed ? formatDuration(item.durationSeconds) : "-",
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
    winnerDetails: statsData.winnerDetails 
  };
};

const drawRandomWinner = async (prisma, payload) => {
  const { attemptId } = payload;

  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
    include: { winner: true },
  });

  if (!attempt) {
    throw new DevBuildError("Attempt not found", StatusCodes.NOT_FOUND);
  }

  const puzzleId = attempt.puzzleId;

  if (!attempt.userId) {
    throw new DevBuildError("Cannot select an anonymous attempt as winner", StatusCodes.BAD_REQUEST);
  }

  if (attempt.status !== "ELIGIBLE") {
    throw new DevBuildError("This entry is not eligible (already a winner or disqualified)", StatusCodes.BAD_REQUEST);
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const targetWinnerType = attempt.completed ? "PUZZLE" : "ALTERNATE";

  const winner = await prisma.$transaction(async (tx) => {
    // Check if the user is already a winner of this puzzle (to enforce unique constraint manually just in case)
    const alreadyWon = await tx.puzzleWinner.findUnique({
      where: {
        puzzleId_userId: {
          puzzleId,
          userId: attempt.userId,
        },
      },
    });

    if (alreadyWon) {
      throw new DevBuildError("This user is already a winner for this puzzle.", StatusCodes.BAD_REQUEST);
    }

    const createdWinner = await tx.puzzleWinner.create({
      data: {
        puzzleId,
        userId: attempt.userId,
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

  return winner;
};

const drawManualWinner = async (prisma, payload) => {
  const { attemptId } = payload;
  
  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
    include: { winner: true },
  });

  if (!attempt) {
    throw new DevBuildError("Attempt not found", StatusCodes.NOT_FOUND);
  }

  const puzzleId = attempt.puzzleId;

  if (!attempt.userId) {
    throw new DevBuildError("Cannot select an anonymous attempt as winner", StatusCodes.BAD_REQUEST);
  }

  if (attempt.status !== "ELIGIBLE") {
    throw new DevBuildError("This entry is not eligible (already a winner or disqualified)", StatusCodes.BAD_REQUEST);
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const targetWinnerType = attempt.completed ? "PUZZLE" : "ALTERNATE";

  const winner = await prisma.$transaction(async (tx) => {
    const alreadyWon = await tx.puzzleWinner.findUnique({
      where: {
        puzzleId_userId: {
          puzzleId,
          userId: attempt.userId,
        },
      },
    });

    if (alreadyWon) {
      throw new DevBuildError("This user is already a winner for this puzzle.", StatusCodes.BAD_REQUEST);
    }

    const createdWinner = await tx.puzzleWinner.create({
      data: {
        puzzleId,
        userId: attempt.userId,
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

  return winner;
};

export const DrawWinnerService = {
  getStats,
  getEligibleEntries,
  drawRandomWinner,
  drawManualWinner,
};
