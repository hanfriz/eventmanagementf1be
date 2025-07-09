import { prisma } from "../config/database";
import {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  ValidatePromotionRequest,
  ValidatePromotionResponse,
  Promotion,
  PromotionFilters,
} from "../interfaces";

export class PromotionService {
  async getAllPromotions(filters: PromotionFilters = {}): Promise<any[]> {
    try {
      const whereClause: any = {};

      if (filters.code) {
        whereClause.code = { contains: filters.code, mode: "insensitive" };
      }
      if (filters.eventId) {
        whereClause.eventId = filters.eventId;
      }
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.validFrom) {
        whereClause.validUntil = { gte: filters.validFrom };
      }
      if (filters.validTo) {
        whereClause.validUntil = { lte: filters.validTo };
      }

      const promotions = await prisma.promotion.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              organizerId: true,
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Transform the data to ensure consistent structure
      return promotions.map((promotion) => ({
        id: promotion.id,
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        validUntil: promotion.validUntil,
        maxUses: promotion.maxUses,
        currentUses: promotion.currentUses,
        minPurchase: promotion.minPurchase,
        isActive: promotion.isActive,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
        event: promotion.event,
        usageCount: promotion._count.transactions,
        // Add computed fields that frontend might expect
        isExpired: new Date() > promotion.validUntil,
        isMaxedOut: promotion.maxUses
          ? promotion.currentUses >= promotion.maxUses
          : false,
        remainingUses: promotion.maxUses
          ? promotion.maxUses - promotion.currentUses
          : null,
      }));
    } catch (error) {
      console.error("Error in getAllPromotions:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch promotions"
      );
    }
  }

  async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      const promotion = await prisma.promotion.findUnique({
        where: { id },
        include: { event: true },
      });

      return promotion;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch promotion"
      );
    }
  }

  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    try {
      const {
        code,
        discountPercent,
        validUntil,
        maxUses,
        minPurchase,
        isActive = true,
        eventId,
      } = data;

      // If eventId is provided, check if event exists and doesn't already have a promotion
      if (eventId) {
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, promotionId: true },
        });

        if (!event) {
          throw new Error("Event not found");
        }

        if (event.promotionId) {
          throw new Error("Event already has a promotion assigned");
        }
      }

      // Generate unique code if needed
      let uniqueCode = code;
      let codeExists = await prisma.promotion.findUnique({
        where: { code: uniqueCode },
      });

      // If code exists, generate a unique one
      if (codeExists) {
        const baseCode = code.split("-")[0]; // Extract base code if it already has suffix
        let attempts = 0;
        while (codeExists && attempts < 10) {
          const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
          uniqueCode = `${baseCode}-${randomSuffix}`;
          codeExists = await prisma.promotion.findUnique({
            where: { code: uniqueCode },
          });
          attempts++;
        }

        if (codeExists) {
          throw new Error(
            "Unable to generate unique promotion code after multiple attempts"
          );
        }
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Create the promotion
        const promotion = await tx.promotion.create({
          data: {
            code: uniqueCode,
            discountPercent,
            validUntil: new Date(validUntil),
            maxUses,
            minPurchase,
            isActive,
          },
        });

        // If eventId is provided, link the promotion to the event
        if (eventId) {
          await tx.event.update({
            where: { id: eventId },
            data: { promotionId: promotion.id },
          });
        }

        return promotion;
      });

      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create promotion"
      );
    }
  }

  async updatePromotion(
    id: string,
    data: UpdatePromotionRequest
  ): Promise<Promotion> {
    try {
      // Check if promotion exists
      const existingPromotion = await prisma.promotion.findUnique({
        where: { id },
      });

      if (!existingPromotion) {
        throw new Error("Promotion not found");
      }

      // Check if code is being updated and if it already exists
      if (data.code && data.code !== existingPromotion.code) {
        const codeExists = await prisma.promotion.findUnique({
          where: { code: data.code },
        });

        if (codeExists) {
          throw new Error("Promotion code already exists");
        }
      }

      const updatedPromotion = await prisma.promotion.update({
        where: { id },
        data: {
          ...data,
          validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
          updatedAt: new Date(),
        },
      });

      return updatedPromotion;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to update promotion"
      );
    }
  }

  async deletePromotion(
    id: string,
    userId?: string,
    userRole?: string
  ): Promise<void> {
    try {
      const existingPromotion = await prisma.promotion.findUnique({
        where: { id },
        include: {
          event: {
            select: {
              organizerId: true,
            },
          },
        },
      });

      if (!existingPromotion) {
        throw new Error("Promotion not found");
      }

      // Check permissions: ADMIN can delete any promotion, ORGANIZER can only delete their own event's promotions
      if (userRole !== "ADMIN" && userId) {
        if (!existingPromotion.event) {
          throw new Error("Promotion is not linked to any event");
        }
        if (existingPromotion.event.organizerId !== userId) {
          throw new Error("You can only delete promotions for your own events");
        }
      }

      await prisma.promotion.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete promotion"
      );
    }
  }

  async validatePromotionCode(
    data: ValidatePromotionRequest
  ): Promise<ValidatePromotionResponse> {
    try {
      const { code, eventId, totalAmount } = data;

      const promotion = await prisma.promotion.findUnique({
        where: { code },
        include: { event: true },
      });

      if (!promotion) {
        return {
          valid: false,
          message: "Promotion code not found",
        };
      }

      if (!promotion.isActive) {
        return {
          valid: false,
          message: "Promotion code is not active",
        };
      }

      if (new Date() > promotion.validUntil) {
        return {
          valid: false,
          message: "Promotion code has expired",
        };
      }

      if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
        return {
          valid: false,
          message: "Promotion code has reached maximum usage limit",
        };
      }

      if (
        promotion.minPurchase &&
        totalAmount &&
        totalAmount < promotion.minPurchase
      ) {
        return {
          valid: false,
          message: `Minimum purchase amount is ${promotion.minPurchase}`,
        };
      }

      // Calculate discount
      let discountAmount = 0;
      let finalAmount = totalAmount || 0;

      if (totalAmount) {
        discountAmount = (totalAmount * promotion.discountPercent) / 100;
        finalAmount = totalAmount - discountAmount;
      }

      return {
        valid: true,
        promotion,
        discountAmount,
        finalAmount,
        message: "Promotion code is valid",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to validate promotion code"
      );
    }
  }

  async applyPromotion(code: string): Promise<Promotion> {
    try {
      const promotion = await prisma.promotion.findUnique({
        where: { code },
      });

      if (!promotion) {
        throw new Error("Promotion code not found");
      }

      if (!promotion.isActive) {
        throw new Error("Promotion code is not active");
      }

      if (new Date() > promotion.validUntil) {
        throw new Error("Promotion code has expired");
      }

      if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
        throw new Error("Promotion code has reached maximum usage limit");
      }

      // Increment usage count
      const updatedPromotion = await prisma.promotion.update({
        where: { code },
        data: {
          currentUses: promotion.currentUses + 1,
          updatedAt: new Date(),
        },
      });

      return updatedPromotion;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to apply promotion"
      );
    }
  }

  async getActivePromotions(): Promise<any[]> {
    try {
      const promotions = await prisma.promotion.findMany({
        where: {
          isActive: true,
          validUntil: { gt: new Date() },
          OR: [
            { maxUses: null },
            { maxUses: { gt: prisma.promotion.fields.currentUses } },
          ],
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              organizerId: true,
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Transform the data to ensure consistent structure
      return promotions.map((promotion) => ({
        id: promotion.id,
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        validUntil: promotion.validUntil,
        maxUses: promotion.maxUses,
        currentUses: promotion.currentUses,
        minPurchase: promotion.minPurchase,
        isActive: promotion.isActive,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
        event: promotion.event,
        usageCount: promotion._count.transactions,
        // Add computed fields that frontend might expect
        isExpired: false, // Since we filter by validUntil > now()
        isMaxedOut: promotion.maxUses
          ? promotion.currentUses >= promotion.maxUses
          : false,
        remainingUses: promotion.maxUses
          ? promotion.maxUses - promotion.currentUses
          : null,
      }));
    } catch (error) {
      console.error("Error in getActivePromotions:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch active promotions"
      );
    }
  }

  async getPromotionsByOrganizer(organizerId: string): Promise<any[]> {
    try {
      const promotions = await prisma.promotion.findMany({
        where: {
          event: {
            organizerId: organizerId,
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              organizerId: true,
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Transform the data to match frontend expectations
      return promotions.map((promotion) => ({
        id: promotion.id,
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        validUntil: promotion.validUntil,
        maxUses: promotion.maxUses,
        currentUses: promotion.currentUses,
        minPurchase: promotion.minPurchase,
        isActive: promotion.isActive,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
        event: promotion.event,
        usageCount: promotion._count.transactions,
        // Add computed fields that frontend might expect
        isExpired: new Date() > promotion.validUntil,
        isMaxedOut: promotion.maxUses
          ? promotion.currentUses >= promotion.maxUses
          : false,
        remainingUses: promotion.maxUses
          ? promotion.maxUses - promotion.currentUses
          : null,
      }));
    } catch (error) {
      console.error("Error in getPromotionsByOrganizer:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch organizer promotions"
      );
    }
  }

  async linkPromotionToEvent(
    promotionId: string,
    eventId: string
  ): Promise<boolean> {
    try {
      // Check if promotion exists
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: { event: true },
      });

      if (!promotion) {
        throw new Error("Promotion not found");
      }

      if (promotion.event) {
        throw new Error("Promotion is already linked to an event");
      }

      // Check if event exists and doesn't have a promotion
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, promotionId: true },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      if (event.promotionId) {
        throw new Error("Event already has a promotion assigned");
      }

      // Link promotion to event
      await prisma.event.update({
        where: { id: eventId },
        data: { promotionId: promotionId },
      });

      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to link promotion to event"
      );
    }
  }

  async unlinkPromotionFromEvent(eventId: string): Promise<boolean> {
    try {
      // Check if event exists and has a promotion
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, promotionId: true },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      if (!event.promotionId) {
        throw new Error("Event doesn't have a promotion assigned");
      }

      // Unlink promotion from event
      await prisma.event.update({
        where: { id: eventId },
        data: { promotionId: null },
      });

      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to unlink promotion from event"
      );
    }
  }
}

export const promotionService = new PromotionService();
