import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { reviewValidators } from "../validators/review.validator";
import { authenticate } from "../middleware/auth";

const router = Router();

// Get event reviews (public)
router.get("/event/:eventId", reviewController.getEventReviews);

// Get organizer profile with stats and reviews (public)
router.get(
  "/organizer/:organizerId/profile",
  reviewController.getOrganizerProfile
);

// Get review by ID (public)
router.get("/:reviewId", reviewController.getReviewById);

// Check if user can review event (requires authentication)
router.get(
  "/can-review/:eventId",
  authenticate,
  reviewController.canUserReview
);

// Get user's review for specific event (requires authentication)
router.get(
  "/my-review/:eventId",
  authenticate,
  reviewController.getUserReviewForEvent
);

// Get user reviews (requires authentication)
router.get("/user/my-reviews", authenticate, reviewController.getUserReviews);

// Create review (requires authentication)
router.post(
  "/",
  authenticate,
  reviewValidators.create,
  reviewController.createReview
);

// Update review (requires authentication)
router.put(
  "/:reviewId",
  authenticate,
  reviewValidators.update,
  reviewController.updateReview
);

// Delete review (requires authentication)
router.delete("/:reviewId", authenticate, reviewController.deleteReview);

export default router;
