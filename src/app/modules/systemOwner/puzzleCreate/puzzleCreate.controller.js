import { StatusCodes } from "http-status-codes";
import { PuzzleCreateService } from "./puzzleCreate.service.js";
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
  puzzleName: puzzle.title,
  publishDate: puzzle.publishDate,
  difficulty: puzzle.difficulty.toLowerCase(),
  status: puzzle.status.toLowerCase(),
  dailyPrize: puzzle.dailyPrize,
  row: puzzle.rows,
  column: puzzle.columns,
  createdAt: puzzle.createdAt,
  updatedAt: puzzle.updatedAt,
});

const createPuzzle = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PuzzleCreateService.createPuzzle(
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
    const result = await PuzzleCreateService.getAllPuzzles(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Puzzles retrieved successfully",
      meta: result.meta,
      data: result.data.map(mapPuzzleResponse),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getPuzzleById = async (req, res) => {
  try {
    const result = await PuzzleCreateService.getPuzzleById(
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
    const result = await PuzzleCreateService.updatePuzzle(
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
    const result = await PuzzleCreateService.deletePuzzle(
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

export const PuzzleCreateController = {
  createPuzzle,
  getAllPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
};
