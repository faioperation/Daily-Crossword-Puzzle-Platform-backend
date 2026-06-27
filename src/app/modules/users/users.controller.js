import { StatusCodes } from "http-status-codes";
import { UsersService } from "./users.service.js";
import { OtpService } from "../otp/otp.service.js";
import prisma from "../../prisma/client.js";
import DevBuildError from "../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Users Error:", error);
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

const signup = async (req, res) => {
  try {
    const { user } = await UsersService.signup(prisma, req.body);

    // Automatically send OTP after signup
    await OtpService.sendOtp(
      prisma,
      user.email,
      user.name,
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await UsersService.getProfile(prisma, req.user.id);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await UsersService.updateProfile(prisma, req.user.id, req.body);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Authorization check: only SYSTEM_OWNER or the user themselves can delete the account
    if (req.user.role !== "SYSTEM_OWNER" && req.user.id !== targetUserId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden. You can only delete your own account.",
      });
    }

    await UsersService.deleteUser(prisma, targetUserId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { isActive } = req.body;

    const updated = await UsersService.updateUserStatus(prisma, targetUserId, isActive);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User status updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await UsersService.getAllUsers(prisma, req.query);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Users retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const UsersController = {
  signup,
  getProfile,
  updateProfile,
  deleteUser,
  updateUserStatus,
  getAllUsers,
};
