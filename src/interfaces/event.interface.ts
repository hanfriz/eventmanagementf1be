import { EventCategory } from "@prisma/client";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: Date;
  endDate: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  isFree: boolean;
  image?: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  tags: string[];
  organizerId: string;
  promotionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for backward compatibility
export interface IEvent extends Event {}

export interface EventWithDetails extends Event {
  organizer?: {
    id: string;
    fullName: string;
    email: string;
  };
  promotion?: any;
  reviews?: any[];
  averageRating: number;
  _count?: {
    transactions: number;
    reviews: number;
  };
}

// Alias for backward compatibility
export interface IEventWithDetails extends EventWithDetails {}

export interface CreateEventDTO {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: Date;
  endDate: Date;
  price: number;
  totalSeats: number;
  isFree: boolean;
  image?: string;
  tags: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  category?: EventCategory;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  price?: number;
  totalSeats?: number;
  isFree?: boolean;
  image?: string;
  status?: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  tags?: string[];
}

export interface EventFilters {
  category?: EventCategory;
  location?: string;
  search?: string;
  status?: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: "date" | "popularity" | "price";
  sortOrder?: "asc" | "desc";
  organizerId?: string;
  tags?: string[];
  isFree?: boolean;
  hasPromotion?: boolean;
  hasReviews?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  isPromotionOnly?: boolean;
  averageRating?: {
    min?: number;
    max?: number;
  };
  availableSeats?: {
    min?: number;
    max?: number;
  };
  totalSeats?: {
    min?: number;
    max?: number;
  };
  pointsUsed?: {
    min?: number;
    max?: number;
  };
  paymentMethod?: string;
  statusFilter?:
    | "WAITING_PAYMENT"
    | "WAITING_CONFIRM"
    | "DONE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  paymentDeadline?: {
    before?: string;
    after?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
}
