import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { CreateManagerSchema, ResetManagerPasswordSchema } from "../types/auth.js";
import { getNextSequence } from "../utils/counter.js";

/**
 * Admin creates a new Manager.
 * Manager sub_id auto-increments globally starting at 314.
 */
export const createManager = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = CreateManagerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Get next Manager sequence ID starting at 314
    const seq = await getNextSequence("manager_sub_id", 314);
    const sub_id = seq.toString();

    const manager = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: "manager",
      sub_id,
    });

    res.status(201).json({
      message: "Manager created successfully",
      manager: {
        id: (manager._id as any).toString(),
        name: manager.name,
        email: manager.email,
        role: manager.role,
        sub_id: manager.sub_id,
        createdAt: manager.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin resets a Manager's password.
 */
export const resetManagerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = ResetManagerPasswordSchema.parse(req.body);

    const manager = await User.findById(validatedData.managerId);
    if (!manager || manager.role !== "manager") {
      res.status(404).json({ error: "Manager not found" });
      return;
    }

    manager.password = validatedData.newPassword;
    await manager.save();

    res.status(200).json({
      message: "Manager password reset successfully",
      manager: {
        id: (manager._id as any).toString(),
        name: manager.name,
        email: manager.email,
        sub_id: manager.sub_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin lists all Managers
 */
export const getManagers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const managers = await User.find({ role: "manager" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ managers });
  } catch (error) {
    next(error);
  }
};
