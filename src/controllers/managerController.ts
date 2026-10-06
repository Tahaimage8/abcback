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

    let managerSubId = manager.sub_id;
    if (!managerSubId && manager.role === "admin") {
      managerSubId = "314";
    }

    if (!managerSubId) {
      res.status(400).json({ error: "Manager does not have a valid sub_id. Please ensure account has a sub_id." });
      return;
    }

    const targetEmail = validatedData.email || (validatedData.username?.includes("@") ? validatedData.username : undefined);
    const targetUsername = validatedData.username || validatedData.email;

    // Check if email or username already exists
    const queryConditions: any[] = [];
    if (targetEmail) queryConditions.push({ email: targetEmail });
    if (targetUsername) queryConditions.push({ username: targetUsername });

    const existingUser = await User.findOne({ $or: queryConditions });
    if (existingUser) {
      res.status(400).json({ error: "Field Officer with this email/username already exists" });
      return;
    }

    // Auto-increment Field Officer sequence for this manager
    const counterId = `fo_sub_id_${managerSubId}`;
    const foSeq = await getNextSequence(counterId, 1);
    const sub_id = `${managerSubId}/${foSeq}`;

    const fieldOfficer = await User.create({
      name: validatedData.name,
      email: targetEmail || validatedData.email,
      username: targetUsername || validatedData.username,
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
        email: fieldOfficer.email,
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
