import { body, ValidationChain } from "express-validator";

// Custom CUID validator (Prisma uses CUID format, not UUID)
const isCuid = (value: string) => {
  return /^c[a-z0-9]{24}$/.test(value);
};

// Review validation rules
export const reviewValidators = {
  create: [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Comment cannot exceed 1000 characters")
      .trim(),
    body("eventId").custom(isCuid).withMessage("Valid event ID is required"),
  ] as ValidationChain[],

  update: [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Comment cannot exceed 1000 characters")
      .trim(),
  ] as ValidationChain[],
};

export default reviewValidators;
