import { Router } from "express";
import {
  createNumberEntry,
  getNumberEntries,
  getNumberEntryById,
  deleteNumberEntry,
} from "../controllers/numbersController.js";
import { authenticate, optionalAuthenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", optionalAuthenticate, createNumberEntry);
router.get("/", optionalAuthenticate, getNumberEntries);
router.get("/:id", optionalAuthenticate, getNumberEntryById);
router.delete("/:id", authenticate, authorize("admin"), deleteNumberEntry);

export default router;
