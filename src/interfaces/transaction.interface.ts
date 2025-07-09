import { TransactionStatus } from "@prisma/client";

// Transaction-related interfaces
export interface Transaction {
  id: string;
  totalAmount: number;
  pointsUsed: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string | null;
  paymentProof: string | null;
  status: TransactionStatus;
  paymentDeadline: Date | null;
  confirmationDeadline: Date | null;
  notes: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  eventId: string;
  promotionId: string | null;
}

// Alias for backward compatibility
export interface ITransaction extends Transaction {}

export interface CreateTransactionRequest {
  eventId: string;
  quantity?: number;
  pointsUsed?: number;
  promotionCode?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  paymentMethod?: string;
  paymentProof?: string;
  status?: TransactionStatus;
  notes?: string;
}

export interface TransactionCalculation {
  originalAmount: number;
  pointsDiscount: number;
  promotionDiscount: number;
  finalAmount: number;
  availablePoints: number;
}

export interface MyTicketResponse {
  id: string;
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    image: string | null;
    organizer: {
      id: string;
      fullName: string;
    };
  };
  quantity: number;
  finalAmount: number;
  status: TransactionStatus;
  paymentDeadline: Date | null;
  confirmationDeadline: Date | null;
  paymentProof: string | null;
  createdAt: Date;
  canReview: boolean;
}

export interface CreateTransactionDTO {
  userId: string;
  eventId: string;
  quantity?: number;
  pointsUsed?: number;
  paymentMethod?: string;
  promotionId?: string;
  discountAmount?: number;
}

export interface UpdateTransactionDTO {
  paymentProof?: string;
  status?: TransactionStatus;
  notes?: string;
}

export interface TransactionFilters {
  userId?: string;
  eventId?: string;
  status?: TransactionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}
