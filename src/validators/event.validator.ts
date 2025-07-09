import { body, param, query, ValidationChain } from "express-validator";
import { EventCategory } from "@prisma/client";

// Custom CUID validator (Prisma uses CUID format, not UUID)
const isCuid = (value: string) => {
  return /^c[a-z0-9]{24}$/.test(value);
};

export const validateCreateEvent: ValidationChain[] = [
  body("title")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("category")
    .isIn(Object.values(EventCategory))
    .withMessage("Invalid event category"),
  body("location")
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),
  body("startDate")
    .isISO8601()
    .withMessage("Valid start date is required")
    .custom((startDate) => {
      if (new Date(startDate) <= new Date()) {
        throw new Error("Start date must be in the future");
      }
      return true;
    }),
  body("endDate")
    .isISO8601()
    .withMessage("Valid end date is required")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((price, { req }) => {
      if (!req.body.isFree && price <= 0) {
        throw new Error("Price must be greater than 0 for paid events");
      }
      return true;
    }),
  body("totalSeats")
    .isInt({ min: 1, max: 100000 })
    .withMessage("Total seats must be between 1 and 100,000"),
  body("isFree").isBoolean().withMessage("isFree must be a boolean"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),
];

export const validateUpdateEvent: ValidationChain[] = [
  body("title")
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("category")
    .optional()
    .isIn(Object.values(EventCategory))
    .withMessage("Invalid event category"),
  body("location")
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("totalSeats")
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage("Total seats must be between 1 and 100,000"),
  body("isFree").optional().isBoolean().withMessage("isFree must be a boolean"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("status")
    .optional()
    .isIn(["UPCOMING", "ACTIVE", "ENDED", "CANCELLED"])
    .withMessage("Invalid event status"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const validateEventId: ValidationChain[] = [
  param("id").custom(isCuid).withMessage("Valid event ID is required"),
];

export const validateEventFilters: ValidationChain[] = [
  query("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  query("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(["UPCOMING", "ACTIVE", "ENDED", "CANCELLED"])
    .withMessage("Invalid event status"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("sortBy")
    .optional()
    .isIn(["date", "popularity", "price"])
    .withMessage("Sort by must be one of: date, popularity, price"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
  query("isFree")
    .optional()
    .isBoolean()
    .withMessage("isFree must be a boolean"),
  query("hasPromotion")
    .optional()
    .isBoolean()
    .withMessage("hasPromotion must be a boolean"),
  query("priceMin")
    .optional()
    .isNumeric()
    .withMessage("Price minimum must be a number"),
  query("priceMax")
    .optional()
    .isNumeric()
    .withMessage("Price maximum must be a number"),
  query("dateStart")
    .optional()
    .isISO8601()
    .withMessage("Date start must be a valid ISO8601 date"),
  query("dateEnd")
    .optional()
    .isISO8601()
    .withMessage("Date end must be a valid ISO8601 date"),
  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Minimum rating must be between 0 and 5"),
  query("maxRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Maximum rating must be between 0 and 5"),
  query("minSeats")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum seats must be a non-negative integer"),
  query("maxSeats")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum seats must be a non-negative integer"),
  query("organizerId")
    .optional()
    .isString()
    .withMessage("Organizer ID must be a string"),
  query("tags").optional().isString().withMessage("Tags must be a string"),
];

/**
 * Event validator object with grouped validation methods
 */
export const eventValidator = {
  createEvent: validateCreateEvent,
  updateEvent: validateUpdateEvent,
  eventId: validateEventId,
  eventFilters: validateEventFilters,
};
