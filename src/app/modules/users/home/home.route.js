import { Router } from "express";
import { HomeController } from "./home.controller.js";
import { checkAuthOptional } from "../../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { HomeValidation } from "./home.validation.js";

const router = Router();

router.get("/active-puzzle", checkAuthOptional, HomeController.getActivePuzzle);
router.get("/recent-winners", HomeController.getRecentWinners);

router.post(
  "/submit-attempt",
  checkAuthOptional,
  validateRequest(HomeValidation.submitAttemptSchema),
  HomeController.submitAttempt,
);

export const HomeRouter = router;
