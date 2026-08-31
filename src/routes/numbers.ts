import { Router } from "express";
import {
  createNumberEntry,
  getNumberEntries,
  getNumberEntryById,
  deleteNumberEntry,
} from "../controllers/numbersController.js";

const router = Router();

router.post("/", createNumberEntry);
router.get("/", getNumberEntries);
router.get("/:id", getNumberEntryById);
router.delete("/:id", deleteNumberEntry);

export default router;
