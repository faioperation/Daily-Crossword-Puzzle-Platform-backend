import { Router } from "express";
import { DrawWinnerController } from "./drawWinner.controller.js";
import { DrawWinnerValidation } from "./drawWinner.validation.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get(
  "/eligible-entries",
  validateRequest(DrawWinnerValidation.getEligibleEntriesSchema),
  DrawWinnerController.getEligibleEntries,
);

router.post(
  "/draw-random",
  validateRequest(DrawWinnerValidation.drawRandomWinnerSchema),
  DrawWinnerController.drawRandomWinner,
);

router.post(
  "/draw-manual",
  validateRequest(DrawWinnerValidation.drawManualWinnerSchema),
  DrawWinnerController.drawManualWinner,
);

export const DrawWinnerRouter = router;