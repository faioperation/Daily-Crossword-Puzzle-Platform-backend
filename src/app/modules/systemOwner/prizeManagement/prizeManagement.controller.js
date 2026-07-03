import { StatusCodes } from "http-status-codes";
import { PrizeManagementService } from "./prizeManagement.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("PrizeManagement Error:", error);
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

const getAllPrizes = async (req, res) => {
  try {
    const result = await PrizeManagementService.getAllPrizes(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Prizes retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updatePrizeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { prizeStatus } = req.body;

    const result = await PrizeManagementService.updatePrizeStatus(
      prisma,
      id,
      prizeStatus,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Prize status updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const PrizeManagementController = {
  getAllPrizes,
  updatePrizeStatus,
};
