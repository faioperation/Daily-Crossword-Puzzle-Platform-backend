import { Router } from "express";
import { PuzzleCreateController } from "./puzzleCreate.controller.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { PuzzleCreateValidation } from "./puzzleCreate.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// Apply auth middleware for all routes in this router
router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

// Create a puzzle
router.post(
  "/create",
  validateRequest(PuzzleCreateValidation.createPuzzleSchema),
  PuzzleCreateController.createPuzzle,
);

// Get all puzzles
router.get("/all", PuzzleCreateController.getAllPuzzles);

// Get single puzzle by ID
router.get("/:id", PuzzleCreateController.getPuzzleById);

// Update a puzzle by ID
router.patch(
  "/:id",
  validateRequest(PuzzleCreateValidation.updatePuzzleSchema),
  PuzzleCreateController.updatePuzzle,
);

// Delete a puzzle by ID
router.delete("/:id", PuzzleCreateController.deletePuzzle);

export const PuzzleCreateRouter = router;
