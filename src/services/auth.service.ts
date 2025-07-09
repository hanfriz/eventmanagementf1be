import { config } from "../config";
import { prisma } from "../config/database";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  JWTPayload,
} from "../interfaces";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "../utils/auth.helper";

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, fullName, password, role = "CUSTOMER" } = data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Hash password using helper
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          fullName,
          password: hashedPassword,
          role,
        },
      });

      // Generate JWT token using helper
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || "",
          role: user.role,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password using helper
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token using helper
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || "",
          role: user.role,
          points: user.points,
        },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  // Use helper functions instead of private methods
  // generateToken and verifyToken are now imported from auth.helper.ts

  /**
   * Verify JWT token using helper
   */
  verifyToken(token: string): JWTPayload {
    try {
      return verifyToken(token);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password using helper
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password using helper
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Password change failed"
      );
    }
  }
}

export const authService = new AuthService();
