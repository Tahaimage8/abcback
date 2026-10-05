import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types/auth.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "super_secret_jwt_key_abcschool_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
