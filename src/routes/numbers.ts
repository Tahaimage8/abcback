import { Router } from "express";
import {
  createNumberEntry,
  getNumberEntries,
  getNumberEntryById,
  deleteNumberEntry,
} from "../controllers/numbersController.js";

const router = Router();

// Routes without middleware for now
router.post("/", createNumberEntry);
router.get("/", getNumberEntries);
router.get("/:id", getNumberEntryById);
router.delete("/:id", deleteNumberEntry);

export default router;
