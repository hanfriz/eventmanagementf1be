import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { userService } from "../services/user.service";
import { reviewService } from "../services/review.service";
import { responseHelper } from "../utils";
import { UpdateUserDTO } from "../interfaces";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const user = await userService.getUserProfile(req.user.id);

      if (!user) {
        res.status(404).json(responseHelper.error("User not found"));
        return;
      }

      res.json(responseHelper.success("Profile retrieved successfully", user));
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json(responseHelper.error("Failed to retrieve profile"));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(responseHelper.error("Validation failed", errors.array()));
        return;
      }

      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const updateData: UpdateUserDTO = req.body;
      const updatedUser = await userService.updateUserProfile(
        req.user.id,
        updateData
      );

      if (!updatedUser) {
        res.status(404).json(responseHelper.error("Failed to update profile"));
        return;
      }

      res.json(
        responseHelper.success("Profile updated successfully", updatedUser)
      );
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(500).json(responseHelper.error("Failed to update profile"));
    }
  }

  /**
   * Get user's created events
   */
  async getMyEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const events = await userService.getUserEvents(req.user.id);

      const eventsWithStats = events.map((event) => ({
        ...event,
        availableSeats: event.totalSeats - event._count.transactions,
        registrations: event._count.transactions,
        reviewsCount: event._count.reviews,
      }));

      res.json(
        responseHelper.success(
          "User events retrieved successfully",
          eventsWithStats
        )
      );
    } catch (error) {
      console.error("Error in getMyEvents:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve user events"));
    }
  }

  /**
   * Get user's transaction history
   */
  async getMyTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const transactions = await userService.getUserTransactions(req.user.id);

      res.json(
        responseHelper.success(
          "Transaction history retrieved successfully",
          transactions
        )
      );
    } catch (error) {
      console.error("Error in getMyTransactions:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve transaction history"));
    }
  }

  /**
   * Get user's reviews
   */
  async getMyReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const reviews = await userService.getUserReviews(req.user.id);

      res.json(
        responseHelper.success("User reviews retrieved successfully", reviews)
      );
    } catch (error) {
      console.error("Error in getMyReviews:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve user reviews"));
    }
  }

  /**
   * Get user points
   */
  async getMyPoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const points = await userService.getUserPoints(req.user.id);

      if (points === null) {
        res.status(404).json(responseHelper.error("User not found"));
        return;
      }

      res.json(
        responseHelper.success("User points retrieved successfully", { points })
      );
    } catch (error) {
      console.error("Error in getMyPoints:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve user points"));
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await userService.getAllUsers(Number(page), Number(limit));

      res.json(responseHelper.success("Users retrieved successfully", result));
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json(responseHelper.error("Failed to retrieve users"));
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserProfile(id);

      if (!user) {
        res.status(404).json(responseHelper.error("User not found"));
        return;
      }

      res.json(responseHelper.success("User retrieved successfully", user));
    } catch (error) {
      console.error("Error in getUserById:", error);
      res.status(500).json(responseHelper.error("Failed to retrieve user"));
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const success = await userService.deleteUser(req.user.id);

      if (!success) {
        res.status(400).json(responseHelper.error("Failed to delete account"));
        return;
      }

      res.json(responseHelper.success("Account deleted successfully"));
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      res.status(500).json(responseHelper.error("Failed to delete account"));
    }
  }

  /**
   * Get organizer profile with ratings and reviews
   */
  async getOrganizerProfile(req: Request, res: Response): Promise<void> {
    try {
      const { organizerId } = req.params;

      const profile = await reviewService.getOrganizerProfile(organizerId);

      res.json(
        responseHelper.success(
          "Organizer profile retrieved successfully",
          profile
        )
      );
    } catch (error) {
      console.error("Error in getOrganizerProfile:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve organizer profile"));
    }
  }

  /**
   * Get organizer profile with comprehensive stats and reviews
   */
  async getOrganizerProfileWithStats(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { organizerId } = req.params;

      const profile = await reviewService.getOrganizerProfileWithStats(
        organizerId
      );

      res.json(
        responseHelper.success(
          "Organizer profile with stats retrieved successfully",
          profile
        )
      );
    } catch (error) {
      console.error("Error in getOrganizerProfileWithStats:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve organizer profile";
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json(responseHelper.error(message));
    }
  }
}

export const userController = new UserController();
