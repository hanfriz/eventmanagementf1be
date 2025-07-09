import { prisma } from "../config/database";
import {
  IEvent,
  IEventWithDetails,
  CreateEventDTO,
  UpdateEventDTO,
  EventFilters,
  PaginationResult,
} from "../interfaces";
import { EventStatus, EventCategory } from "@prisma/client";

export class EventService {
  /**
   * Get all events with filters and pagination
   */
  async getEvents(filters: EventFilters, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply basic filters
    if (filters.category) where.category = filters.category;
    if (filters.location)
      where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.status) where.status = filters.status;
    if (filters.organizerId) where.organizerId = filters.organizerId;
    if (filters.isFree !== undefined) where.isFree = filters.isFree;

    // Search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Price range filter
    if (filters.priceRange) {
      if (
        filters.priceRange.min !== undefined ||
        filters.priceRange.max !== undefined
      ) {
        where.price = {};
        if (filters.priceRange.min !== undefined)
          where.price.gte = filters.priceRange.min;
        if (filters.priceRange.max !== undefined)
          where.price.lte = filters.priceRange.max;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start || filters.dateRange.end) {
        where.startDate = {};
        if (filters.dateRange.start)
          where.startDate.gte = new Date(filters.dateRange.start);
        if (filters.dateRange.end)
          where.startDate.lte = new Date(filters.dateRange.end);
      }
    }

    // Available seats filter
    if (filters.availableSeats) {
      // This needs to be handled in the application layer since it's a calculated field
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    // Promotion filter
    if (filters.hasPromotion) {
      where.promotionId = { not: null };
    }

    // Determine sort order
    let orderBy: any = { startDate: "asc" }; // Default sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "date":
          orderBy = { startDate: filters.sortOrder || "asc" };
          break;
        case "price":
          orderBy = { price: filters.sortOrder || "asc" };
          break;
        case "popularity":
          orderBy = { createdAt: "desc" }; // Use creation date as proxy for popularity
          break;
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, fullName: true, email: true },
          },
          promotion: {
            include: {
              _count: {
                select: { transactions: true },
              },
            },
          },
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { transactions: true, reviews: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.event.count({ where }),
    ]);

    const eventsWithDetails = events.map((event) => {
      const availableSeats = event.totalSeats - event._count.transactions;
      const averageRating =
        event.reviews.length > 0
          ? event.reviews.reduce((sum, review) => sum + review.rating, 0) /
            event.reviews.length
          : 0;

      // Enhance promotion details with computed fields
      let enhancedPromotion = null;
      if (event.promotion) {
        enhancedPromotion = {
          ...event.promotion,
          usageCount: event.promotion._count.transactions,
          isExpired: new Date() > event.promotion.validUntil,
          isMaxedOut: event.promotion.maxUses
            ? event.promotion.currentUses >= event.promotion.maxUses
            : false,
          remainingUses: event.promotion.maxUses
            ? event.promotion.maxUses - event.promotion.currentUses
            : null,
          isValid:
            event.promotion.isActive &&
            new Date() <= event.promotion.validUntil &&
            (!event.promotion.maxUses ||
              event.promotion.currentUses < event.promotion.maxUses),
        };
      }

      return {
        ...event,
        promotion: enhancedPromotion,
        availableSeats,
        averageRating,
      };
    });

    // Apply post-processing filters that need calculated fields
    let filteredEvents = eventsWithDetails;

    // Filter by available seats
    if (filters.availableSeats) {
      filteredEvents = filteredEvents.filter((event) => {
        const seats = event.availableSeats;
        const min = filters.availableSeats?.min;
        const max = filters.availableSeats?.max;
        return (
          (min === undefined || seats >= min) &&
          (max === undefined || seats <= max)
        );
      });
    }

    // Filter by average rating
    if (filters.averageRating) {
      filteredEvents = filteredEvents.filter((event) => {
        const rating = event.averageRating;
        const min = filters.averageRating?.min;
        const max = filters.averageRating?.max;
        return (
          (min === undefined || rating >= min) &&
          (max === undefined || rating <= max)
        );
      });
    }

    return {
      events: filteredEvents,
      pagination: {
        page,
        limit,
        total: filteredEvents.length, // Note: This is approximate due to post-processing
        pages: Math.ceil(filteredEvents.length / limit),
      },
    };
  }

  /**
   * Get single event with full details
   */
  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, fullName: true, email: true },
        },
        promotion: {
          include: {
            _count: {
              select: { transactions: true },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { transactions: true, reviews: true },
        },
      },
    });

    if (!event) return null;

    const averageRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, review) => sum + review.rating, 0) /
          event.reviews.length
        : 0;

    // Enhance promotion details with computed fields
    let enhancedPromotion = null;
    if (event.promotion) {
      enhancedPromotion = {
        ...event.promotion,
        usageCount: event.promotion._count.transactions,
        isExpired: new Date() > event.promotion.validUntil,
        isMaxedOut: event.promotion.maxUses
          ? event.promotion.currentUses >= event.promotion.maxUses
          : false,
        remainingUses: event.promotion.maxUses
          ? event.promotion.maxUses - event.promotion.currentUses
          : null,
        isValid:
          event.promotion.isActive &&
          new Date() <= event.promotion.validUntil &&
          (!event.promotion.maxUses ||
            event.promotion.currentUses < event.promotion.maxUses),
      };
    }

    return {
      ...event,
      promotion: enhancedPromotion,
      availableSeats: event.totalSeats - event._count.transactions,
      averageRating,
    };
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventDTO, organizerId: string) {
    return await prisma.event.create({
      data: {
        ...data,
        organizerId,
        status: EventStatus.UPCOMING,
        availableSeats: data.totalSeats, // Set availableSeats equal to totalSeats initially
      },
      include: {
        organizer: {
          select: { id: true, fullName: true, email: true },
        },
        promotion: true,
      },
    });
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventDTO, organizerId: string) {
    // First check if event exists and belongs to organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!existingEvent || existingEvent.organizerId !== organizerId) {
      return null;
    }

    return await prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: { id: true, fullName: true, email: true },
        },
        promotion: true,
      },
    });
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string, organizerId: string): Promise<boolean> {
    try {
      // First check if event exists and belongs to organizer
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { organizerId: true },
      });

      if (!existingEvent || existingEvent.organizerId !== organizerId) {
        return false;
      }

      await prisma.event.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get events by organizer
   */
  async getEventsByOrganizer(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        promotion: {
          include: {
            _count: {
              select: { transactions: true },
            },
          },
        },
        _count: {
          select: { transactions: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return events.map((event) => {
      // Enhance promotion details with computed fields
      let enhancedPromotion = null;
      if (event.promotion) {
        enhancedPromotion = {
          ...event.promotion,
          usageCount: event.promotion._count.transactions,
          isExpired: new Date() > event.promotion.validUntil,
          isMaxedOut: event.promotion.maxUses
            ? event.promotion.currentUses >= event.promotion.maxUses
            : false,
          remainingUses: event.promotion.maxUses
            ? event.promotion.maxUses - event.promotion.currentUses
            : null,
          isValid:
            event.promotion.isActive &&
            new Date() <= event.promotion.validUntil &&
            (!event.promotion.maxUses ||
              event.promotion.currentUses < event.promotion.maxUses),
        };
      }

      return {
        ...event,
        promotion: enhancedPromotion,
        organizer: undefined, // Not needed for organizer's own events
        reviews: [], // Not needed for listing
        availableSeats: event.totalSeats - event._count.transactions,
        averageRating: 0, // Can be calculated separately if needed
      };
    });
  }

  /**
   * Update event status
   */
  async updateEventStatus(id: string, status: EventStatus): Promise<boolean> {
    try {
      await prisma.event.update({
        where: { id },
        data: { status },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available seats for an event
   */
  async getAvailableSeats(eventId: string): Promise<number | null> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        totalSeats: true,
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!event) return null;

    return event.totalSeats - event._count.transactions;
  }

  /**
   * Check if event is full
   */
  async isEventFull(eventId: string): Promise<boolean> {
    const availableSeats = await this.getAvailableSeats(eventId);
    return availableSeats !== null && availableSeats <= 0;
  }

  /**
   * Get events that need status updates (for cron jobs)
   */
  async getEventsNeedingStatusUpdate() {
    const now = new Date();

    return await prisma.event.findMany({
      where: {
        OR: [
          // Events that should be ACTIVE (started but not ended)
          {
            status: EventStatus.UPCOMING,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          // Events that should be ENDED
          {
            status: { in: [EventStatus.UPCOMING, EventStatus.ACTIVE] },
            endDate: { lt: now },
          },
        ],
      },
    });
  }
}

export const eventService = new EventService();
