import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// Only system owners (admins) can view dashboard stats
router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get("/", DashboardController.getDashboardStats);

export const DashboardRouter = router;
