import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import { QueryBuilder } from "../../../utils/QueryBuilder.js";

const getAllPrizes = async (prisma, query) => {
  const queryBuilder = new QueryBuilder(query)
    .search(["reward", { user: ["name", "email"] }])
    .filter()
    .sort("-announcedAt")
    .paginate();

  // If a date filter is passed, filter announcedAt/createdAt for that day
  if (query.date) {
    const startOfDay = new Date(query.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(query.date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    queryBuilder.where.announcedAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const builtQuery = queryBuilder.build();
  
  // Exclude select from builtQuery as we manually include user relation
  delete builtQuery.select;

  const [prizes, total] = await Promise.all([
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

  const mappedData = prizes.map((item) => ({
    id: item.id,
    winnerName: item.user.name,
    winnerEmail: item.user.email,
    prize: item.reward,
    dateWon: item.announcedAt 
      ? item.announcedAt.toISOString().split("T")[0] 
      : item.createdAt.toISOString().split("T")[0],
    currentStatus: item.prizeStatus || "EMAIL_SENT",
  }));

  return { meta, data: mappedData };
};

const updatePrizeStatus = async (prisma, id, prizeStatus) => {
  const winner = await prisma.puzzleWinner.findUnique({
    where: { id },
  });

  if (!winner) {
    throw new DevBuildError("Winner record not found", StatusCodes.NOT_FOUND);
  }

  const updated = await prisma.puzzleWinner.update({
    where: { id },
    data: { prizeStatus },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    winnerName: updated.user.name,
    winnerEmail: updated.user.email,
    prize: updated.reward,
    dateWon: updated.announcedAt 
      ? updated.announcedAt.toISOString().split("T")[0] 
      : updated.createdAt.toISOString().split("T")[0],
    currentStatus: updated.prizeStatus,
  };
};

export const PrizeManagementService = {
  getAllPrizes,
  updatePrizeStatus,
};
