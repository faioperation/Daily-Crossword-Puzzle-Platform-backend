import { Router } from "express";
import { PuzzleCellController } from "./puzzleChell.controller.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { PuzzleCellValidation } from "./puzzleChell.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// Apply auth middleware for all routes in this router
router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

// Create cell
router.post(
  "/create/:puzzleId",
  validateRequest(PuzzleCellValidation.createCellSchema),
  PuzzleCellController.createCell,
);

// Get all cells of a puzzle
router.get("/:puzzleId", PuzzleCellController.getAllCells);

// Get single cell of a puzzle
router.get("/:puzzleId/:id", PuzzleCellController.getCellById);

// Update cell of a puzzle
router.patch(
  "/:puzzleId/:id",
  validateRequest(PuzzleCellValidation.updateCellSchema),
  PuzzleCellController.updateCell,
);

// Delete cell of a puzzle
router.delete("/:puzzleId/:id", PuzzleCellController.deleteCell);

export const PuzzleCellRouter = router;
