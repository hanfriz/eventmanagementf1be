import { Router } from "express";
import { EventCategory } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth";
import { eventController } from "../controllers/event.controller";
import { eventValidator } from "../validators";

const router = Router();

// Get all events with filters
router.get("/", eventValidator.eventFilters, eventController.getEvents);

// Get single event
router.get("/:id", eventController.getEventById);

// Create event
router.post(
  "/",
  authenticate,
  eventValidator.createEvent,
  eventController.createEvent
);

// Update event
router.put(
  "/:id",
  authenticate,
  eventValidator.updateEvent,
  eventController.updateEvent
);

// Delete event
router.delete("/:id", authenticate, eventController.deleteEvent);

// Get available seats for an event
router.get("/:id/seats", eventController.getAvailableSeats);

// Check event availability
router.get("/:id/availability", eventController.checkEventAvailability);

// Get current user's events
router.get("/user/my-events", authenticate, eventController.getMyEvents);

export default router;
