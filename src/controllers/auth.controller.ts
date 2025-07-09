import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/response.helper";
import { generateToken } from "../utils/auth.helper";
import { RegisterRequest, LoginRequest } from "../interfaces";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      const registerData: RegisterRequest = req.body;
      const result = await authService.register(registerData);

      res.status(201).json(successResponse(result.message, result));
    } catch (error) {
      console.error("Register error:", error);
      const message =
        error instanceof Error ? error.message : "Registration failed";
      res.status(400).json(errorResponse(message));
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      const loginData: LoginRequest = req.body;
      const result = await authService.login(loginData);

      res.status(200).json(successResponse(result.message, result));
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(400).json(errorResponse(message));
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      // Get user from auth middleware
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json(
        successResponse("Password changed successfully", {
          message: "Password changed successfully",
        })
      );
    } catch (error) {
      console.error("Change password error:", error);
      const message =
        error instanceof Error ? error.message : "Password change failed";
      res.status(400).json(errorResponse(message));
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      // Get user profile from user service
      // This would typically call userService.getUserById(userId)
      // For now, return the user data from the token
      const user = (req as any).user;

      res
        .status(200)
        .json(successResponse("Profile retrieved successfully", { user }));
    } catch (error) {
      console.error("Get profile error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to get profile";
      res.status(500).json(errorResponse(message));
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;
      const userRole = (req as any).user?.role;

      if (!userId || !userEmail || !userRole) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      // Generate new token with same payload using helper
      const token = generateToken({
        id: userId,
        email: userEmail,
        role: userRole,
      });

      res
        .status(200)
        .json(successResponse("Token refreshed successfully", { token }));
    } catch (error) {
      console.error("Refresh token error:", error);
      const message =
        error instanceof Error ? error.message : "Token refresh failed";
      res.status(500).json(errorResponse(message));
    }
  }
}

export const authController = new AuthController();
