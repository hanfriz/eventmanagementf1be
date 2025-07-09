import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { transactionService } from "../services/transaction.service";
import { responseHelper } from "../utils";
import { CreateTransactionDTO } from "../interfaces";
import { TransactionStatus } from "@prisma/client";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TransactionController {
  /**
   * Create new transaction (register for event)
   */
  async createTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(responseHelper.error("Validation failed", errors.array()));
        return;
      }

      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const transactionData: CreateTransactionDTO = {
        ...req.body,
        userId: req.user.id,
      };

      const transaction = await transactionService.createTransaction(
        transactionData
      );

      if (!transaction) {
        res
          .status(400)
          .json(
            responseHelper.error(
              "Failed to create transaction. Please try again."
            )
          );
        return;
      }

      // Handle specific error cases
      if (transaction.error) {
        let errorMessage = "";
        let statusCode = 400;

        switch (transaction.error) {
          case "INSUFFICIENT_SEATS":
            errorMessage = `Event is full. Only ${
              transaction.availableSeats || 0
            } seats remaining, but you requested ${
              transaction.requestedSeats || 1
            } seats.`;
            statusCode = 409; // Conflict
            break;
          case "ALREADY_REGISTERED":
            errorMessage = "You are already registered for this event.";
            statusCode = 409; // Conflict
            break;
          default:
            errorMessage = "Failed to create transaction.";
        }

        res.status(statusCode).json(responseHelper.error(errorMessage));
        return;
      }

      res
        .status(201)
        .json(
          responseHelper.success(
            "Transaction created successfully",
            transaction
          )
        );
    } catch (error) {
      console.error("Error in createTransaction:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to create transaction"));
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json(responseHelper.error("Transaction not found"));
        return;
      }

      res.json(
        responseHelper.success(
          "Transaction retrieved successfully",
          transaction
        )
      );
    } catch (error) {
      console.error("Error in getTransactionById:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve transaction"));
    }
  }

  /**
   * Get current user's transactions
   */
  async getMyTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { status, page, limit } = req.query;

      const filters = {
        status: status as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      const result = await transactionService.getTransactionsByUser(
        req.user.id,
        filters
      );

      res.json(
        responseHelper.success("Transactions retrieved successfully", result)
      );
    } catch (error) {
      console.error("Error in getMyTransactions:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve transactions"));
    }
  }

  /**
   * Get transactions for an event (organizer only)
   */
  async getEventTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { eventId } = req.params;

      // Security check: Verify user is the event organizer or admin
      if (req.user.role !== "ADMIN") {
        const isEventOwner = await transactionService.verifyEventOwnership(
          eventId,
          req.user.id
        );

        if (!isEventOwner) {
          res
            .status(403)
            .json(
              responseHelper.error(
                "You are not authorized to view transactions for this event"
              )
            );
          return;
        }
      }

      const transactions = await transactionService.getTransactionsByEvent(
        eventId
      );

      res.json(
        responseHelper.success(
          "Event transactions retrieved successfully",
          transactions
        )
      );
    } catch (error) {
      console.error("Error in getEventTransactions:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve event transactions"));
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(responseHelper.error("Validation failed", errors.array()));
        return;
      }

      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const transaction = await transactionService.updateTransactionStatus(
        id,
        status,
        req.user.id
      );

      if (!transaction) {
        res
          .status(404)
          .json(responseHelper.error("Transaction not found or unauthorized"));
        return;
      }

      res.json(
        responseHelper.success(
          "Transaction status updated successfully",
          transaction
        )
      );
    } catch (error) {
      console.error("Error in updateTransactionStatus:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to update transaction status"));
    }
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;
      const success = await transactionService.cancelTransaction(
        id,
        req.user.id
      );

      if (!success) {
        res
          .status(400)
          .json(responseHelper.error("Failed to cancel transaction"));
        return;
      }

      res.json(responseHelper.success("Transaction cancelled successfully"));
    } catch (error) {
      console.error("Error in cancelTransaction:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to cancel transaction"));
    }
  }

  /**
   * Complete transaction (admin/system only)
   */
  async completeTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json(responseHelper.error("Admin access required"));
        return;
      }

      const { id } = req.params;
      const success = await transactionService.completeTransaction(id);

      if (!success) {
        res
          .status(400)
          .json(responseHelper.error("Failed to complete transaction"));
        return;
      }

      res.json(responseHelper.success("Transaction completed successfully"));
    } catch (error) {
      console.error("Error in completeTransaction:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to complete transaction"));
    }
  }

  /**
   * Get all transactions (admin only)
   */
  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await transactionService.getAllTransactions(
        Number(page),
        Number(limit)
      );

      res.json(
        responseHelper.success("Transactions retrieved successfully", result)
      );
    } catch (error) {
      console.error("Error in getAllTransactions:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve transactions"));
    }
  }

  /**
   * Get transaction statistics (admin only)
   */
  async getTransactionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await transactionService.getTransactionStats();

      res.json(
        responseHelper.success(
          "Transaction statistics retrieved successfully",
          stats
        )
      );
    } catch (error) {
      console.error("Error in getTransactionStats:", error);
      res
        .status(500)
        .json(
          responseHelper.error("Failed to retrieve transaction statistics")
        );
    }
  }

  /**
   * Check if user is registered for event
   */
  async checkRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { eventId } = req.params;
      const isRegistered = await transactionService.isUserRegistered(
        req.user.id,
        eventId
      );

      res.json(
        responseHelper.success("Registration status checked", { isRegistered })
      );
    } catch (error) {
      console.error("Error in checkRegistration:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to check registration status"));
    }
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json(responseHelper.error("Validation failed", errors.array()));
        return;
      }

      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;
      const { paymentProof } = req.body;

      const transaction = await transactionService.uploadPaymentProof(
        id,
        req.user.id,
        paymentProof
      );

      if (!transaction) {
        res
          .status(400)
          .json(
            responseHelper.error(
              "Failed to upload payment proof. Transaction may not exist, payment deadline may have passed, or transaction is not in waiting payment status."
            )
          );
        return;
      }

      res.json(
        responseHelper.success(
          "Payment proof uploaded successfully",
          transaction
        )
      );
    } catch (error) {
      console.error("Error in uploadPaymentProof:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to upload payment proof"));
    }
  }

  /**
   * Get my tickets (customer's transactions)
   */
  async getMyTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const tickets = await transactionService.getMyTickets(req.user.id);

      res.json(
        responseHelper.success("My tickets retrieved successfully", tickets)
      );
    } catch (error) {
      console.error("Error in getMyTickets:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to retrieve my tickets"));
    }
  }

  /**
   * Accept payment proof (organizer/admin only)
   */
  async acceptPaymentProof(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;

      // Get transaction with event details
      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json(responseHelper.error("Transaction not found"));
        return;
      }

      // Check authorization: only admin or event organizer can accept
      if (req.user.role !== "ADMIN") {
        const isEventOwner = await transactionService.verifyEventOwnership(
          transaction.eventId,
          req.user.id
        );

        if (!isEventOwner) {
          res
            .status(403)
            .json(
              responseHelper.error(
                "You are not authorized to accept this payment proof"
              )
            );
          return;
        }
      }

      // Update transaction status to DONE
      const updatedTransaction =
        await transactionService.updateTransactionStatus(
          id,
          TransactionStatus.DONE
        );

      if (!updatedTransaction) {
        res
          .status(400)
          .json(responseHelper.error("Failed to accept payment proof"));
        return;
      }

      res.json(
        responseHelper.success(
          "Payment proof accepted successfully",
          updatedTransaction
        )
      );
    } catch (error) {
      console.error("Error in acceptPaymentProof:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to accept payment proof"));
    }
  }

  /**
   * Reject payment proof (organizer/admin only)
   */
  async rejectPaymentProof(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      // Get transaction with event details
      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json(responseHelper.error("Transaction not found"));
        return;
      }

      // Check authorization: only admin or event organizer can reject
      if (req.user.role !== "ADMIN") {
        const isEventOwner = await transactionService.verifyEventOwnership(
          transaction.eventId,
          req.user.id
        );

        if (!isEventOwner) {
          res
            .status(403)
            .json(
              responseHelper.error(
                "You are not authorized to reject this payment proof"
              )
            );
          return;
        }
      }

      // Reject transaction (will restore seats and points)
      const success = await transactionService.rejectTransaction(id);

      if (!success) {
        res
          .status(400)
          .json(responseHelper.error("Failed to reject payment proof"));
        return;
      }

      res.json(
        responseHelper.success(
          "Payment proof rejected successfully. Seats and points have been restored."
        )
      );
    } catch (error) {
      console.error("Error in rejectPaymentProof:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to reject payment proof"));
    }
  }
}

export const transactionController = new TransactionController();
