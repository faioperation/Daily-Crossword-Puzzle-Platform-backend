import { StatusCodes } from "http-status-codes";
import { PuzzleCellService } from "./puzzleChell.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("PuzzleCell Error:", error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An internal server error occurred",
  });
};

const createCell = async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const result = await PuzzleCellService.createCell(prisma, puzzleId, req.body);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Puzzle cells created successfully",
      data: {
        cells: result,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllCells = async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const result = await PuzzleCellService.getAllCells(prisma, puzzleId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle cells retrieved successfully",
      data: {
        row: result.row,
        column: result.column,
        cells: result.cells,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getCellById = async (req, res) => {
  try {
    const { puzzleId, id } = req.params;
    const result = await PuzzleCellService.getCellById(prisma, puzzleId, id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle cell retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateCell = async (req, res) => {
  try {
    const { puzzleId, id } = req.params;
    const result = await PuzzleCellService.updateCell(prisma, puzzleId, id, req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle cell updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteCell = async (req, res) => {
  try {
    const { puzzleId, id } = req.params;
    const result = await PuzzleCellService.deleteCell(prisma, puzzleId, id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle cell deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const PuzzleCellController = {
  createCell,
  getAllCells,
  getCellById,
  updateCell,
  deleteCell,
};
