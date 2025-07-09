import { body, param, query, ValidationChain } from "express-validator";
import { TransactionStatus } from "@prisma/client";

// Custom CUID validator (Prisma uses CUID format, not UUID)
const isCuid = (value: string) => {
  return /^c[a-z0-9]{24}$/.test(value);
};

export const validateCreateTransaction: ValidationChain[] = [
  body("eventId").custom(isCuid).withMessage("Valid event ID is required"),
  body("pointsUsed")
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage("Points used must be between 0 and 100,000"),
  body("paymentMethod")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Payment method must be between 2 and 50 characters"),
];

export const validateUpdateTransaction: ValidationChain[] = [
  body("status")
    .isIn(Object.values(TransactionStatus))
    .withMessage("Invalid transaction status"),
  body("paymentProof")
    .optional()
    .isURL()
    .withMessage("Payment proof must be a valid URL"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

export const validateTransactionId: ValidationChain[] = [
  param("id").custom(isCuid).withMessage("Valid transaction ID is required"),
];

export const validateTransactionEventId: ValidationChain[] = [
  param("eventId").custom(isCuid).withMessage("Valid event ID is required"),
];

export const validateTransactionFilters: ValidationChain[] = [
  query("status")
    .optional()
    .isIn(Object.values(TransactionStatus))
    .withMessage("Invalid transaction status"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Valid date from is required"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Valid date to is required"),
  query("amountMin")
    .optional()
    .isNumeric()
    .withMessage("Amount minimum must be a number"),
  query("amountMax")
    .optional()
    .isNumeric()
    .withMessage("Amount maximum must be a number"),
];

/**
 * Transaction validator object with grouped validation methods
 */
export const transactionValidator = {
  createTransaction: validateCreateTransaction,
  updateTransaction: validateUpdateTransaction,
  transactionId: validateTransactionId,
  eventId: validateTransactionEventId,
  transactionFilters: validateTransactionFilters,
};
