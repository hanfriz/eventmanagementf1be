import { ApiResponse, PaginationInfo } from "../interfaces";

/**
 * Create standardized API response
 */
export const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  pagination?: PaginationInfo
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Create success response
 */
export const successResponse = <T>(
  message: string,
  data?: T,
  pagination?: PaginationInfo
): ApiResponse<T> => {
  return createResponse(true, message, data, pagination);
};

/**
 * Create error response
 */
export const errorResponse = (message: string, error?: any): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};

/**
 * Calculate pagination info
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Parse pagination query parameters
 */
export const parsePaginationQuery = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, sortBy, sortOrder };
};

/**
 * Response helper object with common methods
 */
export const responseHelper = {
  success: successResponse,
  error: errorResponse,
  create: createResponse,
  calculatePagination,
  parsePaginationQuery,
};
