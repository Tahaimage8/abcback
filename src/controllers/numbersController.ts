import { Request, Response } from "express";
import { NumberEntry } from "../models/NumberEntry.js";
import { z } from "zod";

const mobileNumberRegex = /^01[3-9]\d{8}$/;
const mobileNumberField = z
  .string()
  .regex(mobileNumberRegex, "Enter a valid Bangladeshi mobile number (e.g., 01712345678)");

const createNumberEntrySchema = z.object({
  userName: z.string().min(1, "Name is required"),
  mobileNumber: mobileNumberField,
  numbers: z.array(mobileNumberField).length(10, "Exactly 10 mobile numbers required"),
  userId: z.string().optional(),
});

// POST /api/numbers - Create entry
export async function createNumberEntry(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createNumberEntrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation Error",
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { userName, mobileNumber, numbers, userId } = parseResult.data;

    const newEntry = await NumberEntry.create({
      userName,
      mobileNumber,
      numbers,
      userId: userId || null,
    });

    res.status(201).json({
      message: "Number entry created successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error creating number entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /api/numbers - List all entries
export async function getNumberEntries(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId: String(userId) } : {};

    const entries = await NumberEntry.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching number entries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /api/numbers/:id - Get single entry by ID
export async function getNumberEntryById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entry = await NumberEntry.findById(id);

    if (!entry) {
      res.status(404).json({ error: "Number entry not found" });
      return;
    }

    res.status(200).json({ data: entry });
  } catch (error) {
    console.error("Error fetching number entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// DELETE /api/numbers/:id - Delete entry by ID
export async function deleteNumberEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await NumberEntry.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ error: "Number entry not found" });
      return;
    }

    res.status(200).json({ message: "Number entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting number entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
