/**
 * Generate random string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Format currency (IDR)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  };

  return new Intl.DateTimeFormat("id-ID", {
    ...defaultOptions,
    ...options,
  }).format(date);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indonesian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize filename for upload
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

/**
 * Calculate distance between two dates in hours
 */
export const getHoursBetweenDates = (date1: Date, date2: Date): number => {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60));
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

/**
 * Parse sort string (e.g., "name:asc,createdAt:desc")
 */
export const parseSortString = (
  sortString: string
): Record<string, "asc" | "desc"> => {
  const sorts: Record<string, "asc" | "desc"> = {};

  if (!sortString) return sorts;

  const sortPairs = sortString.split(",");

  sortPairs.forEach((pair) => {
    const [field, order] = pair.split(":");
    if (field && (order === "asc" || order === "desc")) {
      sorts[field.trim()] = order;
    }
  });

  return sorts;
};
