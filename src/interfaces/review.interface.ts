// Review-related interfaces
export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  rating: number; // 1-5 stars
  comment?: string;
  eventId: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  eventId: string;
  user?: {
    id: string;
    fullName: string | null;
    profilePicture: string | null;
  };
}

export interface ReviewsWithStatsResponse {
  reviews: ReviewResponse[];
  averageRating: number;
  totalReviews: number;
}

// Legacy interfaces for backward compatibility
export interface CreateReviewDTO {
  rating: number;
  comment?: string;
  eventId: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  eventId?: string;
  userId?: string;
  ratingMin?: number;
  ratingMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
