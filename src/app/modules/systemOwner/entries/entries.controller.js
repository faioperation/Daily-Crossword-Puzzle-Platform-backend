import { StatusCodes } from "http-status-codes";
import { EntriesService } from "./entries.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Entries Error:", error);
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

const getEntries = async (req, res) => {
  try {
    const result = await EntriesService.getEntries(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Entries retrieved successfully",
      stats: result.stats,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const EntriesController = {
  getEntries,
};
