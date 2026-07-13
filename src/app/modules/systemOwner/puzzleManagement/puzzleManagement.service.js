import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import { getESTDayBoundaries } from "../../../utils/date.js";

const createPuzzle = async (prisma, userId, payload) => {
  const {
    title,
    description,
    image,
    date,
    difficulty,
    status,
    prize,
    size,
    grid,
    clues,
  } = payload;

  const targetStatus = status?.toUpperCase();
  const targetDateStr = date;

  if (targetStatus === "PUBLISHED") {
    if (!targetDateStr) {
      throw new DevBuildError(
        "Publish date is required when status is PUBLISHED",
        StatusCodes.BAD_REQUEST,
      );
    }

    const targetDate = new Date(targetDateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingPublished = await prisma.puzzle.findFirst({
      where: {
        status: "PUBLISHED",
        publishDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingPublished) {
      throw new DevBuildError(
        "A puzzle is already published for this date. You can only publish one puzzle per day.",
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  const newPuzzle = await prisma.puzzle.create({
    data: {
      title,
      description,
      image,
      publishDate: date ? new Date(date) : null,
      difficulty: difficulty.toUpperCase(),
      status: status.toUpperCase(),
      dailyPrize: prize,
      rows: size,
      columns: size,
      cells: grid,
      clues: clues,
      createdById: userId,
    },
  });

  return newPuzzle;
};

const getAllPuzzles = async (prisma, query) => {
  const {
    search,
    searchTerm,
    searchParam,
    status,
    date,
    publishDate,
    page = 1,
    limit = 10,
  } = query;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { start: startOfToday, end: endOfToday } = getESTDayBoundaries();

  // 1. Calculate dashboard statistics (global across all puzzles)
  const [totalPuzzlesCount, publishedCount, draftCount] = await Promise.all([
    prisma.puzzle.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
    prisma.puzzle.count({ where: { status: "PUBLISHED" } }),
    prisma.puzzle.count({ where: { status: "DRAFT" } }),
  ]);

  // 2. Build where filter for list query
  const where = {};

  if (status && status.toUpperCase() !== "ALL") {
    where.status = status.toUpperCase();
  }

  const querySearch = search || searchTerm || searchParam;
  if (querySearch) {
    where.title = {
      contains: querySearch,
      mode: "insensitive",
    };
  }

  const targetDateStr = date || publishDate;
  if (targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    where.publishDate = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // 3. Fetch list and count
  const [puzzles, total] = await Promise.all([
    prisma.puzzle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: parsedLimit,
    }),
    prisma.puzzle.count({ where }),
  ]);

  // 4. Generate persistent chronological displayId (e.g. PZ-001)
  const allPuzzlesOrdered = await prisma.puzzle.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const idToSequenceMap = {};
  allPuzzlesOrdered.forEach((p, idx) => {
    idToSequenceMap[p.id] = idx + 1;
  });

  // 5. Map each puzzle with clues count and custom formatted fields
  const mappedData = await Promise.all(
    puzzles.map(async (puzzle) => {
      const totalClues = Array.isArray(puzzle.clues) ? puzzle.clues.length : 0;

      const seq = idToSequenceMap[puzzle.id] || 1;
      const displayId = `PZ-${String(seq).padStart(3, "0")}`;

      return {
        id: puzzle.id,
        displayId,
        puzzleName: puzzle.title,
        title: puzzle.title,
        publishDate: puzzle.publishDate
          ? puzzle.publishDate.toISOString().split("T")[0]
          : "-",
        difficulty:
          puzzle.difficulty.charAt(0) +
          puzzle.difficulty.slice(1).toLowerCase(),
        status: puzzle.status.charAt(0) + puzzle.status.slice(1).toLowerCase(),
        dailyPrize: puzzle.dailyPrize,
        row: puzzle.rows,
        column: puzzle.columns,
        totalClues,
        createdAt: puzzle.createdAt,
        updatedAt: puzzle.updatedAt,
      };
    }),
  );

  const meta = {
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPage: Math.ceil(total / parsedLimit),
  };

  return {
    stats: {
      totalPuzzles: totalPuzzlesCount,
      publishedPuzzles: publishedCount,
      draftPuzzles: draftCount,
    },
    meta,
    data: mappedData,
  };
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
    title,
    description,
    image,
    date,
    difficulty,
    status,
    prize,
    size,
    grid,
    clues,
  } = payload;

  const currentStatus =
    status !== undefined ? status.toUpperCase() : puzzle.status;
  const currentDateStr =
    date !== undefined
      ? date
      : puzzle.publishDate
        ? puzzle.publishDate.toISOString()
        : null;

  if (currentStatus === "PUBLISHED") {
    if (!currentDateStr) {
      throw new DevBuildError(
        "Publish date is required when status is PUBLISHED",
        StatusCodes.BAD_REQUEST,
      );
    }

    const targetDate = new Date(currentDateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingPublished = await prisma.puzzle.findFirst({
      where: {
        status: "PUBLISHED",
        publishDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        id: { not: puzzleId },
      },
    });

    if (existingPublished) {
      throw new DevBuildError(
        "A puzzle is already published for this date. You can only publish one puzzle per day.",
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (date !== undefined) updateData.publishDate = date ? new Date(date) : null;
  if (difficulty !== undefined)
    updateData.difficulty = difficulty.toUpperCase();
  if (status !== undefined) updateData.status = status.toUpperCase();
  if (prize !== undefined) updateData.dailyPrize = prize;
  if (size !== undefined) {
    updateData.rows = size;
    updateData.columns = size;
  }
  if (grid !== undefined) updateData.cells = grid;
  if (clues !== undefined) updateData.clues = clues;

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

export const PuzzleManagementService = {
  createPuzzle,
  getAllPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
};
