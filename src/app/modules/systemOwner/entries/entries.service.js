import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";

const getEntries = async (prisma, query) => {
  const { search, date, status, page = 1, limit = 10 } = query;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // 1. Calculate dashboard statistics (global across all attempts)
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setUTCHours(23, 59, 59, 999);

  const [todayEntriesCount, puzzleEntriesCount, alternateEntriesCount] =
    await Promise.all([
      // Today's entries
      prisma.puzzleAttempt.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
          userId: { not: null },
          isTester: false,
        },
      }),
      // Puzzle entries (completed = true)
      prisma.puzzleAttempt.count({
        where: {
          completed: true,
          userId: { not: null },
          isTester: false,
        },
      }),
      // Alternate entries (completed = false)
      prisma.puzzleAttempt.count({
        where: {
          completed: false,
          userId: { not: null },
          isTester: false,
        },
      }),
    ]);

  // 2. Build where filter for list query
  const where = {
    userId: { not: null },
    isTester: false,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  if (date) {
    const targetDate = new Date(date);
    const startOfTargetDay = new Date(targetDate);
    startOfTargetDay.setUTCHours(0, 0, 0, 0);
    const endOfTargetDay = new Date(targetDate);
    endOfTargetDay.setUTCHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startOfTargetDay,
      lte: endOfTargetDay,
    };
  }

  // 3. Fetch list and count
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

  // 4. Format solve duration helper
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
    // displayId: `ENT-${item.id.slice(-4).toUpperCase()}`,
    participant: {
      id: item.user?.id,
      name: item.user?.name,
      email: item.user?.email,
    },
    type: item.completed ? "Puzzle" : "Alternate",
    date: item.createdAt.toISOString().split("T")[0],
    solveTime: item.completed ? formatDuration(item.durationSeconds) : "-",
    status: item.status,
  }));

  const meta = {
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPage: Math.ceil(total / parsedLimit),
  };

  return {
    stats: {
      todayEntries: todayEntriesCount,
      puzzleEntries: puzzleEntriesCount,
      alternateEntries: alternateEntriesCount,
    },
    meta,
    data: mappedData,
  };
};

export const EntriesService = {
  getEntries,
};
