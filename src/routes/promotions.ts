import { Router } from "express";
import { promotionController } from "../controllers/promotion.controller";
import { promotionValidators } from "../validators/promotion.validator";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Get all promotions (public with filters)
router.get("/", promotionController.getAllPromotions);

// Get active promotions (public)
router.get("/active", promotionController.getActivePromotions);

// Get current user's promotions (requires authentication)
router.get("/my-promotions", authenticate, promotionController.getMyPromotions);

// Validate promotion code (public)
router.post(
  "/validate",
  promotionValidators.validate,
  promotionController.validatePromotionCode
);

// Apply promotion code (requires authentication)
router.post("/apply", authenticate, promotionController.applyPromotion);

// Get promotion by ID (public)
router.get("/:id", promotionController.getPromotionById);

// Create promotion (requires authentication and admin/organizer role)
router.post(
  "/",
  authenticate,
  promotionValidators.create,
  promotionController.createPromotion
);

// Update promotion (requires authentication and admin/organizer role)
router.put(
  "/:id",
  authenticate,
  promotionValidators.update,
  promotionController.updatePromotion
);

// Delete promotion (requires authentication and admin/organizer role)
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "ORGANIZER"]),
  promotionController.deletePromotion
);

// Link promotion to event (requires authentication and admin/organizer role)
router.post(
  "/link-to-event",
  authenticate,
  authorize(["ADMIN", "ORGANIZER"]),
  promotionController.linkPromotionToEvent
);

// Unlink promotion from event (requires authentication and admin/organizer role)
router.delete(
  "/unlink-from-event/:eventId",
  authenticate,
  authorize(["ADMIN", "ORGANIZER"]),
  promotionController.unlinkPromotionFromEvent
);

export default router;
