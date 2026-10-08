import { Router } from "express";
import {
  createFONumber,
  getFONumbers,
  updateFONumberStatus,
  deleteFONumber,
} from "../controllers/foNumbersController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, createFONumber);
router.get("/", authenticate, getFONumbers);
router.patch("/:id", authenticate, updateFONumberStatus);
router.delete("/:id", authenticate, deleteFONumber);

export default router;
