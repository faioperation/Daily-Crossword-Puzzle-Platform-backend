import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";

const createCell = async (prisma, puzzleId, payload) => {
  const { cells } = payload;

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  // Validate all cells before starting database operations
  for (const cell of cells) {
    if (cell.row >= puzzle.rows) {
      throw new DevBuildError(
        `Cell row ${cell.row} exceeds puzzle row limit of ${puzzle.rows}`,
        StatusCodes.BAD_REQUEST,
      );
    }
    if (cell.column >= puzzle.columns) {
      throw new DevBuildError(
        `Cell column ${cell.column} exceeds puzzle column limit of ${puzzle.columns}`,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  // Perform bulk deletion and creation of cells in a transaction
  const createdCells = await prisma.$transaction(async (tx) => {
    // Delete existing cells first
    await tx.puzzleCell.deleteMany({
      where: { puzzleId },
    });

    const result = [];
    for (const cell of cells) {
      const newCell = await tx.puzzleCell.create({
        data: {
          puzzleId,
          row: cell.row,
          column: cell.column,
          letter: cell.letter || null,
          isBlack: cell.isBlack || false,
          number: cell.number || null,
        },
      });
      result.push(newCell);
    }
    return result;
  });

  return createdCells;
};

const getAllCells = async (prisma, puzzleId) => {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const cells = await prisma.puzzleCell.findMany({
    where: { puzzleId },
    orderBy: [{ row: "asc" }, { column: "asc" }],
  });

  return {
    row: puzzle.rows,
    column: puzzle.columns,
    cells,
  };
};

const getCellById = async (prisma, puzzleId, cellId) => {
  const cell = await prisma.puzzleCell.findFirst({
    where: {
      id: cellId,
      puzzleId,
    },
  });

  if (!cell) {
    throw new DevBuildError("Cell not found", StatusCodes.NOT_FOUND);
  }

  return cell;
};

const updateCell = async (prisma, puzzleId, cellId, payload) => {
  const cell = await prisma.puzzleCell.findFirst({
    where: {
      id: cellId,
      puzzleId,
    },
  });

  if (!cell) {
    throw new DevBuildError("Cell not found", StatusCodes.NOT_FOUND);
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const { row, column, letter, isBlack, number } = payload;

  const updateData = {};
  if (row !== undefined) {
    if (row >= puzzle.rows) {
      throw new DevBuildError(
        `Cell row exceeds puzzle row limit of ${puzzle.rows}`,
        StatusCodes.BAD_REQUEST,
      );
    }
    updateData.row = row;
  }

  if (column !== undefined) {
    if (column >= puzzle.columns) {
      throw new DevBuildError(
        `Cell column exceeds puzzle column limit of ${puzzle.columns}`,
        StatusCodes.BAD_REQUEST,
      );
    }
    updateData.column = column;
  }

  const targetRow = row !== undefined ? row : cell.row;
  const targetColumn = column !== undefined ? column : cell.column;

  if (row !== undefined || column !== undefined) {
    const existingCell = await prisma.puzzleCell.findFirst({
      where: {
        puzzleId,
        row: targetRow,
        column: targetColumn,
        id: { not: cellId },
      },
    });

    if (existingCell) {
      throw new DevBuildError(
        "A cell already exists at this coordinate",
        StatusCodes.CONFLICT,
      );
    }
  }

  if (letter !== undefined) updateData.letter = letter;
  if (isBlack !== undefined) updateData.isBlack = isBlack;
  if (number !== undefined) updateData.number = number;

  const updatedCell = await prisma.puzzleCell.update({
    where: { id: cellId },
    data: updateData,
  });

  return updatedCell;
};

const deleteCell = async (prisma, puzzleId, cellId) => {
  const cell = await prisma.puzzleCell.findFirst({
    where: {
      id: cellId,
      puzzleId,
    },
  });

  if (!cell) {
    throw new DevBuildError("Cell not found", StatusCodes.NOT_FOUND);
  }

  await prisma.puzzleCell.delete({
    where: { id: cellId },
  });

  return cell;
};

export const PuzzleCellService = {
  createCell,
  getAllCells,
  getCellById,
  updateCell,
  deleteCell,
};
