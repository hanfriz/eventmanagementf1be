import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { reviewService } from "../services/review.service";
import { successResponse, errorResponse } from "../utils/response.helper";
import { CreateReviewRequest, UpdateReviewRequest } from "../interfaces";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ReviewController {
  async getEventReviews(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const reviewsData = await reviewService.getEventReviews(eventId);

      res
        .status(200)
        .json(
          successResponse("Event reviews retrieved successfully", reviewsData)
        );
    } catch (error) {
      console.error("Get event reviews error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch event reviews";
      res.status(500).json(errorResponse(message));
    }
  }

  async getUserReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const reviews = await reviewService.getUserReviews(userId);
      res
        .status(200)
        .json(successResponse("User reviews retrieved successfully", reviews));
    } catch (error) {
      console.error("Get user reviews error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch user reviews";
      res.status(500).json(errorResponse(message));
    }
  }

  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const reviewData: CreateReviewRequest = req.body;
      const review = await reviewService.createReview(userId, reviewData);

      res
        .status(201)
        .json(successResponse("Review created successfully", review));
    } catch (error) {
      console.error("Create review error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create review";
      res.status(400).json(errorResponse(message));
    }
  }

  async updateReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const { reviewId } = req.params;
      const updateData: UpdateReviewRequest = req.body;
      const review = await reviewService.updateReview(
        reviewId,
        userId,
        updateData
      );

      res
        .status(200)
        .json(successResponse("Review updated successfully", review));
    } catch (error) {
      console.error("Update review error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update review";
      res.status(400).json(errorResponse(message));
    }
  }

  async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const { reviewId } = req.params;
      await reviewService.deleteReview(reviewId, userId);

      res.status(200).json(successResponse("Review deleted successfully"));
    } catch (error) {
      console.error("Delete review error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete review";
      res.status(400).json(errorResponse(message));
    }
  }

  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.getReviewById(reviewId);

      if (!review) {
        res.status(404).json(errorResponse("Review not found"));
        return;
      }

      res
        .status(200)
        .json(successResponse("Review retrieved successfully", review));
    } catch (error) {
      console.error("Get review by ID error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch review";
      res.status(500).json(errorResponse(message));
    }
  }

  async canUserReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { eventId } = req.params;

      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const canReview = await reviewService.canUserReview(userId, eventId);

      res.status(200).json(
        successResponse("Review eligibility checked", {
          canReview,
          reason: canReview ? undefined : "User cannot review this event",
        })
      );
    } catch (error) {
      console.error("Check review eligibility error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to check review eligibility";
      res.status(500).json(errorResponse(message));
    }
  }

  async getUserReviewForEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { eventId } = req.params;

      if (!userId) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const review = await reviewService.getUserReviewForEvent(userId, eventId);

      if (!review) {
        res.status(404).json(errorResponse("Review not found"));
        return;
      }

      res
        .status(200)
        .json(successResponse("User review retrieved successfully", review));
    } catch (error) {
      console.error("Get user review for event error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch user review";
      res.status(500).json(errorResponse(message));
    }
  }

  async getOrganizerProfile(req: Request, res: Response): Promise<void> {
    try {
      const { organizerId } = req.params;

      const profile = await reviewService.getOrganizerProfileWithStats(
        organizerId
      );

      res
        .status(200)
        .json(
          successResponse("Organizer profile retrieved successfully", profile)
        );
    } catch (error) {
      console.error("Get organizer profile error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch organizer profile";
      res.status(404).json(errorResponse(message));
    }
  }
}

export const reviewController = new ReviewController();
