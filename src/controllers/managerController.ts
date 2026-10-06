import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { CreateFieldOfficerSchema } from "../types/auth.js";
import { getNextSequence } from "../utils/counter.js";

/**
 * Manager creates a Field Officer.
 * sub_id format: [Manager_Sub_ID]/[FO_Increment] (e.g. 314/1, 314/2)
 */
export const createFieldOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = CreateFieldOfficerSchema.parse(req.body);

    const managerId = req.user?.id;
    if (!managerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const manager = await User.findById(managerId);
    if (!manager || (manager.role !== "manager" && manager.role !== "admin")) {
      res.status(403).json({ error: "Only managers can create Field Officers" });
      return;
    }

    if (!manager.sub_id) {
      res.status(400).json({ error: "Manager does not have a valid sub_id" });
      return;
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: validatedData.username });
    if (existingUsername) {
      res.status(400).json({ error: "Field Officer with this username already exists" });
      return;
    }

    // Auto-increment Field Officer sequence for this manager
    const counterId = `fo_sub_id_${manager.sub_id}`;
    const foSeq = await getNextSequence(counterId, 1);
    const sub_id = `${manager.sub_id}/${foSeq}`;

    const fieldOfficer = await User.create({
      name: validatedData.name,
      username: validatedData.username,
      password: validatedData.password,
      role: "field_officer",
      sub_id,
      parent_manager_id: manager._id,
    });

    res.status(201).json({
      message: "Field Officer created successfully",
      fieldOfficer: {
        id: (fieldOfficer._id as any).toString(),
        name: fieldOfficer.name,
        username: fieldOfficer.username,
        role: fieldOfficer.role,
        sub_id: fieldOfficer.sub_id,
        parent_manager_id: fieldOfficer.parent_manager_id,
        createdAt: fieldOfficer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manager lists their created Field Officers
 */
export const getMyFieldOfficers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const managerId = req.user?.id;
    const fieldOfficers = await User.find({ parent_manager_id: managerId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ fieldOfficers });
  } catch (error) {
    next(error);
  }
};
