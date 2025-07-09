import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { eventService } from "../services/event.service";
import { responseHelper } from "../utils";
import { CreateEventDTO, UpdateEventDTO, EventFilters } from "../interfaces";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class EventController {
  /**
   * Get all events with filters
   */
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(responseHelper.error("Validation failed", errors.array()));
        return;
      }

      const {
        category,
        location,
        search,
        status,
        page = 1,
        limit = 10,
        sortBy,
        sortOrder,
        isFree,
        hasPromotion,
        priceMin,
        priceMax,
        dateStart,
        dateEnd,
        minRating,
        maxRating,
        minSeats,
        maxSeats,
        organizerId,
        tags,
      } = req.query;

      const filters: EventFilters = {
        category: category as any,
        location: location as string,
        search: search as string,
        status: status as any,
        sortBy: sortBy as "date" | "popularity" | "price",
        sortOrder: sortOrder as "asc" | "desc",
        isFree: isFree === "true" ? true : undefined,
        hasPromotion: hasPromotion === "true" ? true : undefined,
        organizerId: organizerId as string,
        tags: tags ? (tags as string).split(",") : undefined,
        priceRange: {
          min: priceMin ? parseInt(priceMin as string) : undefined,
          max: priceMax ? parseInt(priceMax as string) : undefined,
        },
        dateRange: {
          start: dateStart as string,
          end: dateEnd as string,
        },
        averageRating: {
          min: minRating ? parseFloat(minRating as string) : undefined,
          max: maxRating ? parseFloat(maxRating as string) : undefined,
        },
        availableSeats: {
          min: minSeats ? parseInt(minSeats as string) : undefined,
          max: maxSeats ? parseInt(maxSeats as string) : undefined,
        },
      };

      const result = await eventService.getEvents(
        filters,
        Number(page),
        Number(limit)
      );

      res.json(responseHelper.success("Events retrieved successfully", result));
    } catch (error) {
      console.error("Error in getEvents:", error);
      res.status(500).json(responseHelper.error("Failed to retrieve events"));
    }
  }

  /**
   * Get single event by ID
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await eventService.getEventById(id);

      if (!event) {
        res.status(404).json(responseHelper.error("Event not found"));
        return;
      }

      res.json(responseHelper.success("Event retrieved successfully", event));
    } catch (error) {
      console.error("Error in getEventById:", error);
      res.status(500).json(responseHelper.error("Failed to retrieve event"));
    }
  }

  /**
   * Create new event
   */
  async createEvent(req: AuthRequest, res: Response): Promise<void> {
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

      const eventData: CreateEventDTO = req.body;
      const event = await eventService.createEvent(eventData, req.user.id);

      res
        .status(201)
        .json(responseHelper.success("Event created successfully", event));
    } catch (error) {
      console.error("Error in createEvent:", error);
      res.status(500).json(responseHelper.error("Failed to create event"));
    }
  }

  /**
   * Update event
   */
  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const eventData: UpdateEventDTO = req.body;

      const event = await eventService.updateEvent(id, eventData, req.user.id);

      if (!event) {
        res
          .status(404)
          .json(responseHelper.error("Event not found or unauthorized"));
        return;
      }

      res.json(responseHelper.success("Event updated successfully", event));
    } catch (error) {
      console.error("Error in updateEvent:", error);
      res.status(500).json(responseHelper.error("Failed to update event"));
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;
      const success = await eventService.deleteEvent(id, req.user.id);

      if (!success) {
        res
          .status(404)
          .json(responseHelper.error("Event not found or unauthorized"));
        return;
      }

      res.json(responseHelper.success("Event deleted successfully"));
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      res.status(500).json(responseHelper.error("Failed to delete event"));
    }
  }

  /**
   * Get events by current user (organizer)
   */
  async getMyEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const events = await eventService.getEventsByOrganizer(req.user.id);

      res.json(
        responseHelper.success("User events retrieved successfully", events)
      );
    } catch (error) {
      console.error("Error in getMyEvents:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve user events"));
    }
  }

  /**
   * Get available seats for an event
   */
  async getAvailableSeats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const availableSeats = await eventService.getAvailableSeats(id);

      if (availableSeats === null) {
        res.status(404).json(responseHelper.error("Event not found"));
        return;
      }

      res.json(
        responseHelper.success("Available seats retrieved successfully", {
          availableSeats,
        })
      );
    } catch (error) {
      console.error("Error in getAvailableSeats:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve available seats"));
    }
  }

  /**
   * Check if event is full
   */
  async checkEventAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isFull = await eventService.isEventFull(id);
      const availableSeats = await eventService.getAvailableSeats(id);

      if (availableSeats === null) {
        res.status(404).json(responseHelper.error("Event not found"));
        return;
      }

      res.json(
        responseHelper.success("Event availability checked successfully", {
          isFull,
          availableSeats,
        })
      );
    } catch (error) {
      console.error("Error in checkEventAvailability:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to check event availability"));
    }
  }
}

export const eventController = new EventController();
