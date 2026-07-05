import { Router } from "express";
import { HomeController } from "./home.controller.js";
import {
  checkAuthMiddleware,
  checkAuthOptional,
} from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { HomeValidation } from "./home.validation.js";

const router = Router();

router.get("/active-puzzle", checkAuthOptional, HomeController.getActivePuzzle);

router.use(checkAuthMiddleware(Role.USER, Role.SYSTEM_OWNER));

router.post(
  "/start-attempt",
  validateRequest(HomeValidation.startAttemptSchema),
  HomeController.startAttempt,
);

router.post(
  "/check-attempt",
  validateRequest(HomeValidation.checkAttemptSchema),
  HomeController.checkAttempt,
);

router.post(
  "/submit-attempt",
  validateRequest(HomeValidation.submitAttemptSchema),
  HomeController.submitAttempt,
);

export const HomeRouter = router;
