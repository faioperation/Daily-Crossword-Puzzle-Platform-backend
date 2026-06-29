import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import { QueryBuilder } from "../../../utils/QueryBuilder.js";

const createPuzzle = async (prisma, userId, payload) => {
  const {
    puzzleName,
    publishDate,
    difficulty,
    status,
    dailyPrize,
    row,
    column,
  } = payload;

  const newPuzzle = await prisma.puzzle.create({
    data: {
      title: puzzleName,
      publishDate: publishDate ? new Date(publishDate) : null,
      difficulty: difficulty.toUpperCase(),
      status: status.toUpperCase(),
      dailyPrize,
      rows: row,
      columns: column,
      createdById: userId,
    },
  });

  return newPuzzle;
};

const getAllPuzzles = async (prisma, query) => {
  const queryBuilder = new QueryBuilder(query)
    .search(["title"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const builtQuery = queryBuilder.build();

  const [puzzles, total] = await Promise.all([
    prisma.puzzle.findMany(builtQuery),
    prisma.puzzle.count({ where: builtQuery.where }),
  ]);

  const meta = queryBuilder.getMeta(total);

  return { meta, data: puzzles };
};

const getPuzzleById = async (prisma, puzzleId) => {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  return puzzle;
};

const updatePuzzle = async (prisma, puzzleId, payload) => {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const {
    puzzleName,
    publishDate,
    difficulty,
    status,
    dailyPrize,
    row,
    column,
  } = payload;

  const updateData = {};
  if (puzzleName !== undefined) updateData.title = puzzleName;
  if (publishDate !== undefined)
    updateData.publishDate = publishDate ? new Date(publishDate) : null;
  if (difficulty !== undefined)
    updateData.difficulty = difficulty.toUpperCase();
  if (status !== undefined) updateData.status = status.toUpperCase();
  if (dailyPrize !== undefined) updateData.dailyPrize = dailyPrize;
  if (row !== undefined) updateData.rows = row;
  if (column !== undefined) updateData.columns = column;

  const updatedPuzzle = await prisma.puzzle.update({
    where: { id: puzzleId },
    data: updateData,
  });

  return updatedPuzzle;
};

const deletePuzzle = async (prisma, puzzleId) => {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  await prisma.puzzle.delete({
    where: { id: puzzleId },
  });

  return puzzle;
};

export const PuzzleCreateService = {
  createPuzzle,
  getAllPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
};
