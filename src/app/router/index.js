import { Router } from "express";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { UsersRouter } from "../modules/users/users.route.js";
import { PuzzleManagementRouter } from "../modules/systemOwner/puzzleManagement/puzzleManagement.route.js";
import { SettingsRouter } from "../modules/systemOwner/settings/settings.route.js";
import { PrizeManagementRouter } from "../modules/systemOwner/prizeManagement/prizeManagement.route.js";
import { WinnerHistoryRouter } from "../modules/systemOwner/winnerHistory/winnerHistory.route.js";
import { DrawWinnerRouter } from "../modules/systemOwner/drawWinner/drawWinner.route.js";
import { EntriesRouter } from "../modules/systemOwner/entries/entries.route.js";

export const router = Router();
const moduleRoutes = [
  {
    path: "/otp",
    route: OtpRouter,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/users",
    route: UsersRouter,
  },
  {
    path: "/system-owner/puzzle",
    route: PuzzleManagementRouter,
  },

  {
    path: "/system-owner/settings",
    route: SettingsRouter,
  },
  {
    path: "/system-owner/prize-management",
    route: PrizeManagementRouter,
  },
  {
    path: "/system-owner/winner-history",
    route: WinnerHistoryRouter,
  },
  {
    path: "/system-owner/draw-winner",
    route: DrawWinnerRouter,
  },
  {
    path: "/system-owner/entries",
    route: EntriesRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
