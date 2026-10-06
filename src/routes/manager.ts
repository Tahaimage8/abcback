import { Router } from "express";
import {
  createFieldOfficer,
  getMyFieldOfficers,
} from "../controllers/managerController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Protect all manager routes: must be authenticated and have role 'manager' or 'admin'
router.use(authenticate, authorize("manager", "admin"));

router.post("/field-officers", createFieldOfficer);
router.get("/field-officers", getMyFieldOfficers);

export default router;
