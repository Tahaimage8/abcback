import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { RegisterSchema, LoginSchema } from "../types/auth.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role || "user",
    });

    const token = generateToken({
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = LoginSchema.parse(req.body);

    const identifier = (
      validatedData.identifier ||
      validatedData.email ||
      validatedData.username ||
      ""
    ).toLowerCase();

    // Query user by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      sub_id: user.sub_id,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        sub_id: user.sub_id,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
