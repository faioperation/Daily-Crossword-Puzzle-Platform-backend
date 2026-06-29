import { Router } from "express";
import { PrizeManagementController } from "./prizeManagement.controller.js";
import { PrizeManagementValidation } from "./prizeManagement.validation.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get("/", PrizeManagementController.getAllPrizes);

router.patch(
  "/:id/status",
  validateRequest(PrizeManagementValidation.updatePrizeStatusSchema),
  PrizeManagementController.updatePrizeStatus,
);

export const PrizeManagementRouter = router;
