import { StatusCodes } from "http-status-codes";
import { SettingsService } from "./settings.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Settings Error:", error);
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

const getSettings = async (req, res) => {
  try {
    const result = await SettingsService.getSettings(prisma);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Settings retrieved successfully",
      data: {
        ...result,
        systemOwner: {
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
        },
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateSettings = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      // Store relative URL path
      payload.logo = `/uploads/settings/${req.file.filename}`;
    }
    const result = await SettingsService.updateSettings(prisma, payload);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = { ...req.body };
    if (req.file) {
      payload.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    const result = await SettingsService.updateAdminProfile(
      prisma,
      userId,
      payload,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Admin profile updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const SettingsController = {
  getSettings,
  updateSettings,
  updateAdminProfile,
};
