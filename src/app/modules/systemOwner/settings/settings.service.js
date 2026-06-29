import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";

const getSettings = async (prisma) => {
  let settings = await prisma.setting.findFirst();

  // If no settings exist, initialize with default values
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        websiteName: "Daily Crossword Platform",
        supportEmail: "support@crossword.com",
      },
    });
  }

  return settings;
};

const updateSettings = async (prisma, payload) => {
  let settings = await prisma.setting.findFirst();

  // If no settings exist, create with payload
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        websiteName: payload.websiteName || "Daily Crossword Platform",
        supportEmail: payload.supportEmail || "support@crossword.com",
        logo: payload.logo || null,
      },
    });
  } else {
    const updateData = {};
    if (payload.websiteName !== undefined)
      updateData.websiteName = payload.websiteName;
    if (payload.supportEmail !== undefined)
      updateData.supportEmail = payload.supportEmail;
    if (payload.logo !== undefined) updateData.logo = payload.logo;

    settings = await prisma.setting.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  return settings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};
