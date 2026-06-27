import { Router } from "express";
import { UsersController } from "./users.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { UsersValidation } from "./users.validation.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = Router();

router.post(
  "/signup",
  validateRequest(UsersValidation.signupSchema),
  UsersController.signup,
);

router.get(
  "/profile",
  checkAuthMiddleware(...Object.values(Role)),
  UsersController.getProfile,
);

router.patch(
  "/profile",
  checkAuthMiddleware(...Object.values(Role)),
  validateRequest(UsersValidation.updateProfileSchema),
  UsersController.updateProfile,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  UsersController.deleteUser,
);

export const UsersRouter = router;
