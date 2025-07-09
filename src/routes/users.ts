import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorize } from "../middleware/auth";
import { userController } from "../controllers/user.controller";
import { userValidator } from "../validators";

const router = Router();

// Get current user profile
router.get("/profile", authenticate, userController.getProfile);

// Update user profile
router.put(
  "/profile",
  authenticate,
  userValidator.updateUser,
  userController.updateProfile
);

// Get user's created events
router.get("/my-events", authenticate, userController.getMyEvents);

// Get user's reviews
router.get("/my-reviews", authenticate, userController.getMyReviews);

// Get user points
router.get("/my-points", authenticate, userController.getMyPoints);

// Delete user account
router.delete("/account", authenticate, userController.deleteAccount);

// Admin routes
router.get(
  "/all",
  authenticate,
  authorize(["ADMIN"]),
  userController.getAllUsers
);

router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  userController.getUserById
);

// Get organizer profile with ratings
router.get("/organizer/:organizerId", userController.getOrganizerProfile);

// Get organizer profile with comprehensive stats and reviews
router.get(
  "/organizer/:organizerId/profile-stats",
  userController.getOrganizerProfileWithStats
);

export default router;
