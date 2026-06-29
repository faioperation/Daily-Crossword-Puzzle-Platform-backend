import { Router } from "express";
import { WinnerHistoryController } from "./winnerHistory.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get("/", WinnerHistoryController.getWinnerHistory);

router.get("/export", WinnerHistoryController.exportWinnerHistory);

router.get("/:id", WinnerHistoryController.getWinnerById);

export const WinnerHistoryRouter = router;
