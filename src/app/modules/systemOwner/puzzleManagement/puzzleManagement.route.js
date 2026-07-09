import { Router } from "express";
import { PuzzleManagementController } from "./puzzleManagement.controller.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { PuzzleManagementValidation } from "./puzzleManagement.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { uploadPuzzleImage } from "../../../config/multer.config.js";
import parseMultipartFields from "../../../middleware/parseMultipartFields.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.post(
  "/create",
  uploadPuzzleImage.single("image"),
  parseMultipartFields(["size", "grid", "clues"]),
  validateRequest(PuzzleManagementValidation.createPuzzleSchema),
  PuzzleManagementController.createPuzzle,
);

router.get("/all", PuzzleManagementController.getAllPuzzles);

router.get("/:id", PuzzleManagementController.getPuzzleById);

router.patch(
  "/:id",
  uploadPuzzleImage.single("image"),
  parseMultipartFields(["size", "grid", "clues"]),
  validateRequest(PuzzleManagementValidation.updatePuzzleSchema),
  PuzzleManagementController.updatePuzzle,
);

router.delete("/:id", PuzzleManagementController.deletePuzzle);

export const PuzzleManagementRouter = router;
