import { prisma } from "../config/database";
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
  ReviewsWithStatsResponse,
} from "../interfaces";

export interface CreateReviewDTO {
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
}

export interface OrganizerProfileStats {
  totalEvents: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
}

export class ReviewService {
  async getEventReviews(eventId: string): Promise<ReviewsWithStatsResponse> {
    try {
      const reviews = await prisma.review.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate average rating
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      return {
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          userId: review.userId,
          eventId: review.eventId,
          user: review.user,
        })),
        averageRating,
        totalReviews: reviews.length,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch event reviews"
      );
    }
  }

  async getUserReviews(userId: string): Promise<ReviewResponse[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        eventId: review.eventId,
        user: review.user,
      }));
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch user reviews"
      );
    }
  }

  async createReview(
    userId: string,
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    try {
      const { rating, comment, eventId } = data;

      // Check if user has already reviewed this event
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this event");
      }

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user has attended the event (has completed transaction)
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId,
          eventId,
          status: "DONE",
        },
      });

      if (!transaction) {
        throw new Error("You can only review events you have attended");
      }

      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          userId,
          eventId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
      });

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        eventId: review.eventId,
        user: review.user,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create review"
      );
    }
  }

  async updateReview(
    reviewId: string,
    userId: string,
    data: UpdateReviewRequest
  ): Promise<ReviewResponse> {
    try {
      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new Error("Review not found");
      }

      if (existingReview.userId !== userId) {
        throw new Error("You can only update your own reviews");
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
      });

      return {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        userId: updatedReview.userId,
        eventId: updatedReview.eventId,
        user: updatedReview.user,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to update review"
      );
    }
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new Error("Review not found");
      }

      if (existingReview.userId !== userId) {
        throw new Error("You can only delete your own reviews");
      }

      await prisma.review.delete({
        where: { id: reviewId },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete review"
      );
    }
  }

  async getReviewById(reviewId: string): Promise<ReviewResponse | null> {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
      });

      if (!review) {
        return null;
      }

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        eventId: review.eventId,
        user: review.user,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch review"
      );
    }
  }

  /**
   * Create a new review with validation
   */
  async createReviewWithValidation(
    data: CreateReviewDTO
  ): Promise<ReviewResponse | null> {
    try {
      // Check if user attended the event (has completed transaction)
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId: data.userId,
          eventId: data.eventId,
          status: "DONE",
        },
        include: {
          event: { select: { endDate: true, title: true } },
        },
      });

      if (!transaction) {
        throw new Error("You must have attended this event to leave a review");
      }

      // Check if event has ended
      if (new Date() <= transaction.event.endDate) {
        throw new Error("You can only review events after they have ended");
      }

      // Check if user already reviewed this event
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_eventId: {
            userId: data.userId,
            eventId: data.eventId,
          },
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this event");
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId: data.userId,
          eventId: data.eventId,
          rating: data.rating,
          comment: data.comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        eventId: review.eventId,
        user: review.user,
      };
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  }

  /**
   * Get organizer profile with stats and reviews
   */
  async getOrganizerProfile(organizerId: string) {
    try {
      // Get organizer info
      const organizer = await prisma.user.findUnique({
        where: { id: organizerId },
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
          email: true,
          createdAt: true,
        },
      });

      if (!organizer) {
        return null;
      }

      // Get organizer events with reviews
      const events = await prisma.event.findMany({
        where: { organizerId },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              transactions: {
                where: { status: "DONE" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate statistics
      const totalEvents = events.length;
      const allReviews = events.flatMap((event) => event.reviews);
      const totalReviews = allReviews.length;

      const averageRating =
        totalReviews > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          : 0;

      // Rating distribution
      const ratingDistribution = {
        star5: allReviews.filter((r) => r.rating === 5).length,
        star4: allReviews.filter((r) => r.rating === 4).length,
        star3: allReviews.filter((r) => r.rating === 3).length,
        star2: allReviews.filter((r) => r.rating === 2).length,
        star1: allReviews.filter((r) => r.rating === 1).length,
      };

      const stats: OrganizerProfileStats = {
        totalEvents,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      };

      return {
        organizer,
        stats,
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          price: event.price,
          image: event.image,
          totalAttendees: event._count.transactions,
          reviews: event.reviews,
          averageRating:
            event.reviews.length > 0
              ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
                event.reviews.length
              : 0,
          totalReviews: event.reviews.length,
        })),
        recentReviews: allReviews.slice(0, 10), // Latest 10 reviews
      };
    } catch (error) {
      console.error("Error getting organizer profile:", error);
      return null;
    }
  }

  /**
   * Check if user can review an event
   */
  async canUserReview(userId: string, eventId: string): Promise<boolean> {
    try {
      // Check if user attended the event
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId,
          eventId,
          status: "DONE",
        },
        include: {
          event: { select: { endDate: true } },
        },
      });

      if (!transaction) {
        return false;
      }

      // Check if event has ended
      if (new Date() <= transaction.event.endDate) {
        return false;
      }

      // Check if user already reviewed
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      return !existingReview;
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      return false;
    }
  }

  /**
   * Get organizer profile with stats and reviews
   */
  async getOrganizerProfileWithStats(organizerId: string) {
    try {
      // Get organizer user data
      const organizer = await prisma.user.findUnique({
        where: { id: organizerId, role: "ORGANIZER" },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
          points: true,
        },
      });

      if (!organizer) {
        throw new Error("Organizer not found");
      }

      // Get organizer's events
      const events = await prisma.event.findMany({
        where: { organizerId },
        include: {
          organizer: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get all reviews for organizer's events
      const eventIds = events.map((event) => event.id);
      const reviews = await prisma.review.findMany({
        where: { eventId: { in: eventIds } },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate stats
      const totalEvents = events.length;
      const totalReviews = reviews.length;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      // Calculate rating distribution
      const ratingDistribution = {
        star5: reviews.filter((r) => r.rating === 5).length,
        star4: reviews.filter((r) => r.rating === 4).length,
        star3: reviews.filter((r) => r.rating === 3).length,
        star2: reviews.filter((r) => r.rating === 2).length,
        star1: reviews.filter((r) => r.rating === 1).length,
      };

      return {
        user: organizer,
        stats: {
          totalEvents,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          ratingDistribution,
        },
        events: events.map((event) => ({
          ...event,
          averageRating: reviews
            .filter((r) => r.eventId === event.id)
            .reduce(
              (sum, r, _, arr) =>
                arr.length ? sum + r.rating / arr.length : 0,
              0
            ),
        })),
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          userId: review.userId,
          eventId: review.eventId,
          user: review.user,
          event: review.event,
        })),
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch organizer profile"
      );
    }
  }

  /**
   * Get user's review for a specific event
   */
  async getUserReviewForEvent(
    userId: string,
    eventId: string
  ): Promise<ReviewResponse | null> {
    try {
      const review = await prisma.review.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
      });

      if (!review) {
        return null;
      }

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        eventId: review.eventId,
        user: review.user,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch user review"
      );
    }
  }
}

export const reviewService = new ReviewService();
