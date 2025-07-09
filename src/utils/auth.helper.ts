import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../interfaces";

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  const options: SignOptions = {
    expiresIn: "7d", // Use hardcoded value to avoid type issues
  };
  return jwt.sign(payload, config.jwtSecret, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Extract token from authorization header
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
