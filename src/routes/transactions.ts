import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate, authorize } from "../middleware/auth";
import { transactionController } from "../controllers/transaction.controller";
import { transactionValidator } from "../validators";

const router = Router();

// Get current user's transactions (must be before /:id routes)
router.get(
  "/my-transactions",
  authenticate,
  transactionController.getMyTransactions
);

// Get my tickets
router.get("/my-tickets", authenticate, transactionController.getMyTickets);

// Create new transaction (register for event)
router.post(
  "/",
  authenticate,
  transactionValidator.createTransaction,
  transactionController.createTransaction
);

// Get transaction by ID
router.get(
  "/:id",
  authenticate,
  transactionValidator.transactionId,
  transactionController.getTransactionById
);

// Update transaction status
router.put(
  "/:id/status",
  authenticate,
  transactionValidator.transactionId,
  transactionValidator.updateTransaction,
  transactionController.updateTransactionStatus
);

// Cancel transaction
router.post(
  "/:id/cancel",
  authenticate,
  transactionValidator.transactionId,
  transactionController.cancelTransaction
);

// Complete transaction (admin only)
router.post(
  "/:id/complete",
  authenticate,
  authorize(["ADMIN"]),
  transactionValidator.transactionId,
  transactionController.completeTransaction
);

// Get transactions for an event (organizer/admin only)
router.get(
  "/event/:eventId",
  authenticate,
  transactionValidator.eventId,
  transactionController.getEventTransactions
);

// Check if user is registered for event
router.get(
  "/check/:eventId",
  authenticate,
  transactionValidator.eventId,
  transactionController.checkRegistration
);

// Upload payment proof
router.post(
  "/:id/payment-proof",
  authenticate,
  [
    param("id").isString().notEmpty(),
    body("paymentProof").isString().notEmpty(),
  ],
  transactionController.uploadPaymentProof
);

// Accept payment proof (organizer/admin only)
router.post(
  "/:id/accept",
  authenticate,
  [param("id").isString().notEmpty()],
  transactionController.acceptPaymentProof
);

// Reject payment proof (organizer/admin only)
router.post(
  "/:id/reject",
  authenticate,
  [param("id").isString().notEmpty(), body("reason").optional().isString()],
  transactionController.rejectPaymentProof
);

// Admin routes
router.get(
  "/admin/all",
  authenticate,
  authorize(["ADMIN"]),
  transactionController.getAllTransactions
);

router.get(
  "/admin/stats",
  authenticate,
  authorize(["ADMIN"]),
  transactionController.getTransactionStats
);

export default router;
