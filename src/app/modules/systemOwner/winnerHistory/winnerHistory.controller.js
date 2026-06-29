import { StatusCodes } from "http-status-codes";
import { WinnerHistoryService } from "./winnerHistory.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("WinnerHistory Error:", error);
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

const getWinnerHistory = async (req, res) => {
  try {
    const result = await WinnerHistoryService.getWinnerHistory(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Winner history retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const exportWinnerHistory = async (req, res) => {
  try {
    const csvContent = await WinnerHistoryService.exportWinnerHistory(prisma, req.query);
    
    // Set headers to trigger file download in the browser
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=winner-history.csv");
    
    return res.status(StatusCodes.OK).send(csvContent);
  } catch (error) {
    return handleError(res, error);
  }
};

const getWinnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WinnerHistoryService.getWinnerById(prisma, id);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Winner details retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const WinnerHistoryController = {
  getWinnerHistory,
  exportWinnerHistory,
  getWinnerById,
};
