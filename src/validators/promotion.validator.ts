import { body, ValidationChain } from "express-validator";

// Custom CUID validator (Prisma uses CUID format, not UUID)
const isCuid = (value: string) => {
  return /^c[a-z0-9]{24}$/.test(value);
};

// Promotion validation rules
export const promotionValidators = {
  create: [
    body("code")
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Promotion code must be between 3 and 50 characters")
      .trim()
      .toUpperCase(),
    body("discountPercent")
      .isInt({ min: 1, max: 100 })
      .withMessage("Discount percent must be between 1 and 100"),
    body("validUntil")
      .isISO8601()
      .withMessage("Valid until must be a valid date")
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Valid until date must be in the future");
        }
        return true;
      }),
    body("maxUses")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max uses must be a positive integer"),
    body("minPurchase")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum purchase must be a positive number"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ] as ValidationChain[],

  update: [
    body("code")
      .optional()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Promotion code must be between 3 and 50 characters")
      .trim()
      .toUpperCase(),
    body("discountPercent")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Discount percent must be between 1 and 100"),
    body("validUntil")
      .optional()
      .isISO8601()
      .withMessage("Valid until must be a valid date"),
    body("maxUses")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max uses must be a positive integer"),
    body("minPurchase")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum purchase must be a positive number"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ] as ValidationChain[],

  validate: [
    body("code")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Promotion code is required")
      .trim()
      .toUpperCase(),
    body("eventId")
      .optional()
      .custom(isCuid)
      .withMessage("Valid event ID is required"),
    body("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
  ] as ValidationChain[],
};

export default promotionValidators;
