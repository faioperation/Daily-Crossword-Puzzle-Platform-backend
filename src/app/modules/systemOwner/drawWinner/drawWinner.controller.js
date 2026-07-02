import { StatusCodes } from "http-status-codes";
import { DrawWinnerService } from "./drawWinner.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("DrawWinner Error:", error);
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

const getEligibleEntries = async (req, res) => {
  try {
    const result = await DrawWinnerService.getEligibleEntries(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Eligible entries and statistics retrieved successfully",
      stats: result.stats,
      winnerDetails: result.winnerDetails,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getRandomEligibleEntry = async (req, res) => {
  try {
    const result = await DrawWinnerService.getRandomEligibleEntry(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Random eligible entry retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const drawRandomWinner = async (req, res) => {
  try {
    const result = await DrawWinnerService.drawRandomWinner(prisma, req.body);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Random winner drawn successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const drawManualWinner = async (req, res) => {
  try {
    const result = await DrawWinnerService.drawManualWinner(prisma, req.body);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Winner selected manually successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const DrawWinnerController = {
  getEligibleEntries,
  getRandomEligibleEntry,
  drawRandomWinner,
  drawManualWinner,
};
