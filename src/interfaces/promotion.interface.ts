// Promotion-related interfaces
export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: Date;
  maxUses: number | null;
  currentUses: number;
  minPurchase: number | null;
  isActive: boolean;
  eventId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionRequest {
  code: string;
  discountPercent: number;
  validUntil: Date;
  maxUses?: number;
  minPurchase?: number;
  isActive?: boolean;
  eventId?: string;
}

export interface UpdatePromotionRequest {
  code?: string;
  discountPercent?: number;
  validUntil?: Date;
  maxUses?: number;
  minPurchase?: number;
  isActive?: boolean;
}

export interface ValidatePromotionRequest {
  code: string;
  eventId?: string;
  totalAmount?: number;
}

export interface ValidatePromotionResponse {
  valid: boolean;
  promotion?: Promotion & { event?: any };
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

export interface PromotionFilters {
  code?: string;
  eventId?: string;
  userId?: string;
  isActive?: boolean;
  validFrom?: Date;
  validTo?: Date;
}

// Legacy interfaces for backward compatibility
export interface CreatePromotionDTO {
  code: string;
  discountPercent: number;
  validUntil: Date;
  maxUses?: number;
  minPurchase?: number;
  eventId?: string;
}

export interface UpdatePromotionDTO {
  code?: string;
  discountPercent?: number;
  validUntil?: Date;
  maxUses?: number;
  minPurchase?: number;
  isActive?: boolean;
}
