import { Router } from "express";
import {
  createManager,
  resetManagerPassword,
  getManagers,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Protect all admin routes: must be authenticated and have role 'admin'
router.use(authenticate, authorize("admin"));

router.post("/managers", createManager);
router.get("/managers", getManagers);
router.post("/managers/reset-password", resetManagerPassword);

export default router;
