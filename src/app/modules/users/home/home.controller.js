import { StatusCodes } from "http-status-codes";
import { HomeService } from "./home.service.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Home Play Error:", error);
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

const parseUserAgent = (uaString) => {
  if (!uaString) return { browser: "Unknown", os: "Unknown" };
  let browser = "Unknown";
  let os = "Unknown";

  if (uaString.includes("Chrome")) browser = "Chrome";
  else if (uaString.includes("Firefox")) browser = "Firefox";
  else if (uaString.includes("Safari")) browser = "Safari";
  else if (uaString.includes("Edge")) browser = "Edge";

  if (uaString.includes("Windows")) os = "Windows";
  else if (uaString.includes("Macintosh") || uaString.includes("Mac OS"))
    os = "macOS";
  else if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "iOS";
  else if (uaString.includes("Android")) os = "Android";

  return { browser, os };
};

const getActivePuzzle = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const result = await HomeService.getActivePuzzle(prisma, userId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Today's active puzzle loaded successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const startAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const userAgent = req.headers["user-agent"] || "";
    const { browser, os } = parseUserAgent(userAgent);

    const devicePayload = {
      deviceId: req.body.deviceId || "web-client",
      fingerprint: req.body.fingerprint || null,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent,
      browser,
      os,
    };

    const attempt = await HomeService.startAttempt(
      prisma,
      userId,
      devicePayload,
    );
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Attempt started or resumed successfully",
      data: attempt,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const checkAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await HomeService.checkAttempt(prisma, userId, req.body);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Grid checked successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await HomeService.submitAttempt(prisma, userId, req.body);
    return res.status(StatusCodes.OK).json({
      success: result.success,
      message: result.message,
      data: result.attempt || null,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const HomeController = {
  getActivePuzzle,
  startAttempt,
  checkAttempt,
  submitAttempt,
};
