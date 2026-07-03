import { Router } from "express";
import { HomeController } from "./home.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { HomeValidation } from "./home.validation.js";

const router = Router();

router.use(checkAuthMiddleware(Role.USER, Role.SYSTEM_OWNER));

router.get("/active-puzzle", HomeController.getActivePuzzle);

router.post(
  "/start-attempt",
  validateRequest(HomeValidation.startAttemptSchema),
  HomeController.startAttempt
);

router.post(
  "/check-attempt",
  validateRequest(HomeValidation.checkAttemptSchema),
  HomeController.checkAttempt
);

router.post(
  "/submit-attempt",
  validateRequest(HomeValidation.submitAttemptSchema),
  HomeController.submitAttempt
);

export const HomeRouter = router;
