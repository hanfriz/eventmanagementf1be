import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { promotionService } from "../services/promotion.service";
import { successResponse, errorResponse } from "../utils/response.helper";
import {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  ValidatePromotionRequest,
} from "../interfaces";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class PromotionController {
  async getAllPromotions(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const promotions = await promotionService.getAllPromotions(filters);

      res
        .status(200)
        .json(successResponse("Promotions retrieved successfully", promotions));
    } catch (error) {
      console.error("Get all promotions error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch promotions";
      res.status(500).json(errorResponse(message));
    }
  }

  async getPromotionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await promotionService.getPromotionById(id);

      if (!promotion) {
        res.status(404).json(errorResponse("Promotion not found"));
        return;
      }

      res
        .status(200)
        .json(successResponse("Promotion retrieved successfully", promotion));
    } catch (error) {
      console.error("Get promotion by ID error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch promotion";
      res.status(500).json(errorResponse(message));
    }
  }

  async createPromotion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      // Check if user is admin or organizer
      const userRole = req.user?.role;
      if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
        res
          .status(403)
          .json(
            errorResponse("Only admins and organizers can create promotions")
          );
        return;
      }

      const promotionData: CreatePromotionRequest = req.body;
      const promotion = await promotionService.createPromotion(promotionData);

      res
        .status(201)
        .json(successResponse("Promotion created successfully", promotion));
    } catch (error) {
      console.error("Create promotion error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create promotion";
      res.status(400).json(errorResponse(message));
    }
  }

  async updatePromotion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      // Check if user is admin or organizer
      const userRole = req.user?.role;
      if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
        res
          .status(403)
          .json(
            errorResponse("Only admins and organizers can update promotions")
          );
        return;
      }

      const { id } = req.params;
      const updateData: UpdatePromotionRequest = req.body;
      const promotion = await promotionService.updatePromotion(id, updateData);

      res
        .status(200)
        .json(successResponse("Promotion updated successfully", promotion));
    } catch (error) {
      console.error("Update promotion error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update promotion";
      res.status(400).json(errorResponse(message));
    }
  }

  async deletePromotion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Pass user info to service for permission checking
      await promotionService.deletePromotion(id, userId, userRole);

      res.status(200).json(successResponse("Promotion deleted successfully"));
    } catch (error) {
      console.error("Delete promotion error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete promotion";

      // Return 403 for permission errors, 400 for other errors
      const statusCode =
        message.includes("You can only delete") ||
        message.includes("Only admins")
          ? 403
          : 400;
      res.status(statusCode).json(errorResponse(message));
    }
  }

  async validatePromotionCode(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(errorResponse("Validation failed", errors.array()));
        return;
      }

      const validateData: ValidatePromotionRequest = req.body;
      const result = await promotionService.validatePromotionCode(validateData);

      if (!result.valid) {
        res
          .status(400)
          .json(errorResponse(result.message || "Invalid promotion code"));
        return;
      }

      res.status(200).json(successResponse("Promotion code is valid", result));
    } catch (error) {
      console.error("Validate promotion code error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to validate promotion code";
      res.status(500).json(errorResponse(message));
    }
  }

  async applyPromotion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json(errorResponse("Promotion code is required"));
        return;
      }

      const promotion = await promotionService.applyPromotion(code);
      res
        .status(200)
        .json(successResponse("Promotion applied successfully", promotion));
    } catch (error) {
      console.error("Apply promotion error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to apply promotion";
      res.status(400).json(errorResponse(message));
    }
  }

  async getActivePromotions(req: Request, res: Response): Promise<void> {
    try {
      const promotions = await promotionService.getActivePromotions();
      res
        .status(200)
        .json(
          successResponse(
            "Active promotions retrieved successfully",
            promotions
          )
        );
    } catch (error) {
      console.error("Get active promotions error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch active promotions";
      res.status(500).json(errorResponse(message));
    }
  }

  async getMyPromotions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Authentication required"));
        return;
      }

      const promotions = await promotionService.getPromotionsByOrganizer(
        req.user.id
      );

      res
        .status(200)
        .json(
          successResponse("User promotions retrieved successfully", promotions)
        );
    } catch (error) {
      console.error("Get my promotions error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch user promotions";
      res.status(500).json(errorResponse(message));
    }
  }

  async linkPromotionToEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { promotionId, eventId } = req.body;

      if (!promotionId || !eventId) {
        res
          .status(400)
          .json(errorResponse("Promotion ID and Event ID are required"));
        return;
      }

      // Check if user is admin or organizer
      const userRole = req.user?.role;
      if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
        res
          .status(403)
          .json(
            errorResponse("Only admins and organizers can link promotions")
          );
        return;
      }

      const success = await promotionService.linkPromotionToEvent(
        promotionId,
        eventId
      );

      if (success) {
        res
          .status(200)
          .json(successResponse("Promotion linked to event successfully"));
      } else {
        res
          .status(400)
          .json(errorResponse("Failed to link promotion to event"));
      }
    } catch (error) {
      console.error("Link promotion error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to link promotion to event";
      res.status(400).json(errorResponse(message));
    }
  }

  async unlinkPromotionFromEvent(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        res.status(400).json(errorResponse("Event ID is required"));
        return;
      }

      // Check if user is admin or organizer
      const userRole = req.user?.role;
      if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
        res
          .status(403)
          .json(
            errorResponse("Only admins and organizers can unlink promotions")
          );
        return;
      }

      const success = await promotionService.unlinkPromotionFromEvent(eventId);

      if (success) {
        res
          .status(200)
          .json(successResponse("Promotion unlinked from event successfully"));
      } else {
        res
          .status(400)
          .json(errorResponse("Failed to unlink promotion from event"));
      }
    } catch (error) {
      console.error("Unlink promotion error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to unlink promotion from event";
      res.status(400).json(errorResponse(message));
    }
  }
}

export const promotionController = new PromotionController();
