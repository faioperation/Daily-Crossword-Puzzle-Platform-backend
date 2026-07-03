const getDashboardStats = async (prisma) => {
  const today = new Date();

  // Today boundaries
  const startOfToday = new Date(today);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setUTCHours(23, 59, 59, 999);

  // Yesterday boundaries
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setUTCHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setUTCHours(23, 59, 59, 999);

  // 1. Fetch chronological ordered puzzles to determine PZ-XYZ sequence
  const allPuzzlesOrdered = await prisma.puzzle.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const getDisplayId = (puzzleId) => {
    const idx = allPuzzlesOrdered.findIndex((p) => p.id === puzzleId);
    return `PZ-${String(idx !== -1 ? idx + 1 : 1).padStart(3, "0")}`;
  };

  // 2. Fetch active puzzle today
  let activePuzzle = await prisma.puzzle.findFirst({
    where: {
      status: "PUBLISHED",
      publishDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  if (!activePuzzle) {
    activePuzzle = await prisma.puzzle.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishDate: "desc" },
    });
  }

  // 3. Fetch statistics
  const [
    entriesToday,
    entriesYesterday,
    winnersToday,
    totalEntries,
    completedEntries,
  ] = await Promise.all([
    prisma.puzzleAttempt.count({
      where: {
        playDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
    prisma.puzzleAttempt.count({
      where: {
        playDate: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
      },
    }),
    prisma.puzzleWinner.count({
      where: {
        announcedAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
    prisma.puzzleAttempt.count(),
    prisma.puzzleAttempt.count({
      where: {
        completed: true,
      },
    }),
  ]);

  const growthNum = entriesToday - entriesYesterday;
  const growthText =
    growthNum >= 0
      ? `+${growthNum} from yesterday`
      : `${growthNum} from yesterday`;

  const averageSuccessRate =
    totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  // 4. Generate last 7 days chart trends
  const dailyEntriesChart = [];
  const puzzleCompletionRateChart = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);

    const dayName = dayNames[d.getUTCDay()];

    const attempts = await prisma.puzzleAttempt.findMany({
      where: {
        playDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        completed: true,
      },
    });

    const dayTotal = attempts.length;
    const dayCompleted = attempts.filter((a) => a.completed).length;
    const completedRate =
      dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
    const failedRate = dayTotal > 0 ? 100 - completedRate : 0;

    dailyEntriesChart.push({
      day: dayName,
      count: dayTotal,
    });

    puzzleCompletionRateChart.push({
      day: dayName,
      completedRate,
      failedRate,
    });
  }

  return {
    todayPuzzle: activePuzzle
      ? {
          displayId: getDisplayId(activePuzzle.id),
          title: activePuzzle.title,
        }
      : {
          displayId: "PZ-000",
          title: "No active puzzle",
        },
    entriesToday: {
      count: entriesToday,
      change: growthText,
    },
    winners: {
      count: winnersToday,
    },
    activePuzzle: activePuzzle
      ? {
          displayId: getDisplayId(activePuzzle.id),
          status: "Currently running",
        }
      : {
          displayId: "PZ-000",
          status: "Not running",
        },
    totalEntries: {
      count: totalEntries,
    },
    completion: {
      rate: `${averageSuccessRate}%`,
    },
    dailyEntriesChart,
    puzzleCompletionRateChart,
  };
};

export const DashboardService = {
  getDashboardStats,
};
