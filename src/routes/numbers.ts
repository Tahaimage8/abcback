import { Router } from "express";
import {
  createNumberEntry,
  getNumberEntries,
  getNumberEntryById,
  deleteNumberEntry,
} from "../controllers/numbersController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRoles } from "../middleware/roleGuard.js";

const router = Router();

// Apply auth middleware to all number routes
router.use(authenticate);

// POST /api/numbers - Create entry (Requires ADMIN, CLASS_TEACHER, or MEMBER)
router.post(
  "/",
  requireRoles("ADMIN", "CLASS_TEACHER", "MEMBER"),
  createNumberEntry
);

// GET /api/numbers - List entries
router.get("/", getNumberEntries);

// GET /api/numbers/:id - Single entry
router.get("/:id", getNumberEntryById);

// DELETE /api/numbers/:id - Delete entry
router.delete("/:id", deleteNumberEntry);

export default router;
