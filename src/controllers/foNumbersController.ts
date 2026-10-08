import { Request, Response } from "express";
import { FONumber } from "../models/FONumber.js";
import { z } from "zod";

const mobileNumberRegex = /^01[3-9]\d{8}$/;

const createFONumberSchema = z.object({
  number: z
    .string()
    .regex(mobileNumberRegex, "Enter a valid Bangladeshi mobile number (e.g. 01712345678)"),
  payment_method: z.enum(["bkash", "nogod", "rocket", "upay"], {
    errorMap: () => ({ message: "Payment method must be bkash, nogod, rocket, or upay" }),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
});

// POST /api/fo-numbers - Add single number entry for FO
export async function createFONumber(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const parseResult = createFONumberSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation Error",
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { number, payment_method } = parseResult.data;

    const newNumber = await FONumber.create({
      number,
      payment_method,
      status: "active",
      added_by: userId,
    });

    res.status(201).json({
      message: "Number entry added successfully",
      data: newNumber,
    });
  } catch (error) {
    console.error("Error creating FO number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /api/fo-numbers - Fetch numbers for logged-in FO (optional ?status=active|inactive)
export async function getFONumbers(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { status } = req.query;
    const filter: Record<string, unknown> = { added_by: userId };

    if (status && (status === "active" || status === "inactive")) {
      filter.status = status;
    }

    const numbers = await FONumber.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: numbers.length,
      data: numbers,
    });
  } catch (error) {
    console.error("Error fetching FO numbers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// PATCH /api/fo-numbers/:id - Toggle or update status
export async function updateFONumberStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const existing = await FONumber.findOne({ _id: id, added_by: userId });

    if (!existing) {
      res.status(404).json({ error: "Number entry not found or unauthorized" });
      return;
    }

    const parseResult = updateStatusSchema.safeParse(req.body);
    let newStatus: "active" | "inactive" = existing.status === "active" ? "inactive" : "active";

    if (parseResult.success && parseResult.data.status) {
      newStatus = parseResult.data.status;
    }

    existing.status = newStatus;

    await existing.save();

    res.status(200).json({
      message: `Status updated to ${newStatus}`,
      data: existing,
    });
  } catch (error) {
    console.error("Error updating FO number status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// DELETE /api/fo-numbers/:id - Delete single number entry
export async function deleteFONumber(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    // Allow owner or admin/manager to delete
    const filter: Record<string, unknown> = { _id: id };
    if (req.user?.role !== "admin" && req.user?.role !== "manager") {
      filter.added_by = userId;
    }

    const deleted = await FONumber.findOneAndDelete(filter);

    if (!deleted) {
      res.status(404).json({ error: "Number entry not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Number entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting FO number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
