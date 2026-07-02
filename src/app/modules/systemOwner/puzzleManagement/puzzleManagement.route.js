import { Router } from "express";
import { PuzzleManagementController } from "./puzzleManagement.controller.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { PuzzleManagementValidation } from "./puzzleManagement.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.post(
  "/create",
  validateRequest(PuzzleManagementValidation.createPuzzleSchema),
  PuzzleManagementController.createPuzzle,
);

router.get("/all", PuzzleManagementController.getAllPuzzles);

router.get("/:id", PuzzleManagementController.getPuzzleById);

router.patch(
  "/:id",
  validateRequest(PuzzleManagementValidation.updatePuzzleSchema),
  PuzzleManagementController.updatePuzzle,
);

router.delete("/:id", PuzzleManagementController.deletePuzzle);

export const PuzzleManagementRouter = router;
