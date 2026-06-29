import { Router } from "express";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { UsersRouter } from "../modules/users/users.route.js";
import { PuzzleCreateRouter } from "../modules/systemOwner/puzzleCreate/puzzleCreate.route.js";
import { PuzzleCellRouter } from "../modules/systemOwner/puzzleChell/puzzleChell.route.js";
import { SettingsRouter } from "../modules/systemOwner/settings/settings.route.js";

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
    route: PuzzleCreateRouter,
  },
  {
    path: "/system-owner/puzzle/cells",
    route: PuzzleCellRouter,
  },
  {
    path: "/system-owner/settings",
    route: SettingsRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
