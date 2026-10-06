import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "field_officer", "user"]).optional().default("user"),
});

export const LoginSchema = z.object({
  identifier: z.string().optional(), // Can be email or username
  email: z.string().email("Invalid email address").optional(),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => data.identifier || data.email || data.username, {
  message: "Either email, username, or identifier is required",
  path: ["identifier"],
});

export const CreateManagerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ResetManagerPasswordSchema = z.object({
  managerId: z.string().min(1, "Manager ID is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateFieldOfficerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateManagerInput = z.infer<typeof CreateManagerSchema>;
export type ResetManagerPasswordInput = z.infer<typeof ResetManagerPasswordSchema>;
export type CreateFieldOfficerInput = z.infer<typeof CreateFieldOfficerSchema>;

export interface JwtPayload {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: "admin" | "manager" | "field_officer" | "user";
  sub_id?: string;
}
