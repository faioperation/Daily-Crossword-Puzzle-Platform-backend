import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import { QueryBuilder } from "../../../utils/QueryBuilder.js";

// Utility to format values like PUZZLE -> Puzzle, RANDOM -> Random
const formatEnumString = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getWinnerHistory = async (prisma, query) => {
  const queryParams = { ...query };
  const dateVal = queryParams.date;
  delete queryParams.date;

  const queryBuilder = new QueryBuilder(queryParams)
    .search(["reward", { user: ["name", "email"] }])
    .filter()
    .sort("-announcedAt")
    .paginate();

  // Handle date won filtering
  if (dateVal) {
    const startOfDay = new Date(dateVal);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateVal);
    endOfDay.setUTCHours(23, 59, 59, 999);

    queryBuilder.where.announcedAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const builtQuery = queryBuilder.build();
  delete builtQuery.select; // Remove select object as we manually load and map fields

  const [winners, total] = await Promise.all([
    prisma.puzzleWinner.findMany({
      ...builtQuery,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.puzzleWinner.count({ where: builtQuery.where }),
  ]);

  const meta = queryBuilder.getMeta(total);

  const mappedData = winners.map((item) => ({
    id: item.id,
    winnerName: item.user.name,
    winnerEmail: item.user.email,
    type: formatEnumString(item.winnerType),
    winnerDate: item.announcedAt
      ? item.announcedAt.toISOString().split("T")[0]
      : item.createdAt.toISOString().split("T")[0],
    selection: formatEnumString(item.selectionType),
    status: formatEnumString(item.status),
    reward: item.reward || "N/A",
  }));

  return { meta, data: mappedData };
};

const getWinnerById = async (prisma, id) => {
  const item = await prisma.puzzleWinner.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      attempt: {
        select: {
          completedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!item) {
    throw new DevBuildError("Winner record not found", StatusCodes.NOT_FOUND);
  }

  const submissionDate = item.attempt.completedAt
    ? item.attempt.completedAt.toISOString().split("T")[0]
    : item.attempt.createdAt.toISOString().split("T")[0];

  return {
    id: item.id,
    winnerName: item.user.name,
    winnerEmail: item.user.email,
    phone: null,
    prize: item.reward || "N/A",
    type: formatEnumString(item.winnerType),
    selection: formatEnumString(item.selectionType),
    submissionDate,
    winnerDate: item.announcedAt
      ? item.announcedAt.toISOString().split("T")[0]
      : item.createdAt.toISOString().split("T")[0],
    status: formatEnumString(item.status),
  };
};

export const WinnerHistoryService = {
  getWinnerHistory,
  getWinnerById,
};
