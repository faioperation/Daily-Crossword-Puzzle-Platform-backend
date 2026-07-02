import { StatusCodes } from "http-status-codes";
import { PuzzleManagementService } from "./puzzleManagement.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Puzzle Error:", error);
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

const mapPuzzleResponse = (puzzle) => ({
  id: puzzle.id,
  puzzleName: puzzle.title || puzzle.puzzleName,
  publishDate: puzzle.publishDate,
  difficulty: puzzle.difficulty.toLowerCase(),
  status: puzzle.status.toLowerCase(),
  dailyPrize: puzzle.dailyPrize,
  row: puzzle.rows || puzzle.row,
  column: puzzle.columns || puzzle.column,
  createdAt: puzzle.createdAt,
  updatedAt: puzzle.updatedAt,
});

const createPuzzle = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PuzzleManagementService.createPuzzle(
      prisma,
      userId,
      req.body,
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Puzzle created successfully",
      data: mapPuzzleResponse(result),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllPuzzles = async (req, res) => {
  try {
    const result = await PuzzleManagementService.getAllPuzzles(
      prisma,
      req.query,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzles retrieved successfully",
      stats: result.stats,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getPuzzleById = async (req, res) => {
  try {
    const result = await PuzzleManagementService.getPuzzleById(
      prisma,
      req.params.id,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle retrieved successfully",
      data: mapPuzzleResponse(result),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updatePuzzle = async (req, res) => {
  try {
    const result = await PuzzleManagementService.updatePuzzle(
      prisma,
      req.params.id,
      req.body,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle updated successfully",
      data: mapPuzzleResponse(result),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deletePuzzle = async (req, res) => {
  try {
    const result = await PuzzleManagementService.deletePuzzle(
      prisma,
      req.params.id,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzle deleted successfully",
      data: mapPuzzleResponse(result),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const PuzzleManagementController = {
  createPuzzle,
  getAllPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
};
