import { prisma } from "../config/database";
import { CreateTransactionDTO, UpdateTransactionDTO } from "../interfaces";
import { TransactionStatus } from "@prisma/client";
import { cloudinary } from "../config/cloudinary";

export class TransactionService {
  /**
   * Create new transaction (event registration) with seat management
   */
  async createTransaction(data: CreateTransactionDTO): Promise<any | null> {
    try {
      // Check if event exists and has available seats
      const event = await prisma.event.findUnique({
        where: { id: data.eventId },
        select: {
          id: true,
          title: true,
          totalSeats: true,
          availableSeats: true,
          price: true,
        },
      });

      if (!event) {
        return null;
      }

      const quantity = data.quantity || 1;

      // Check if enough seats available
      if (event.availableSeats < quantity) {
        return {
          error: "INSUFFICIENT_SEATS",
          availableSeats: event.availableSeats,
          requestedSeats: quantity,
        };
      }

      // Check if user already registered for this event
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          userId: data.userId,
          eventId: data.eventId,
          status: {
            notIn: [
              TransactionStatus.CANCELLED,
              TransactionStatus.REJECTED,
              TransactionStatus.EXPIRED,
            ],
          },
        },
      });

      if (existingTransaction) {
        return { error: "ALREADY_REGISTERED" };
      }

      // Get user's points for validation
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { points: true },
      });

      const availablePoints = user?.points || 0;
      const pointsToUse = Math.min(data.pointsUsed || 0, availablePoints);

      // Calculate final amount (1 point = 1 IDR)
      const totalAmount = event.price * quantity;
      const finalAmount = Math.max(0, totalAmount - pointsToUse);

      // Set payment deadline (2 hours from now)
      const paymentDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Use database transaction for atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Reserve seats first (optimistic locking)
        const updatedEvent = await tx.event.update({
          where: {
            id: data.eventId,
            availableSeats: { gte: quantity }, // Ensure seats still available
          },
          data: {
            availableSeats: { decrement: quantity },
          },
          select: { availableSeats: true },
        });

        // Deduct user points
        if (pointsToUse > 0) {
          await tx.user.update({
            where: { id: data.userId },
            data: { points: { decrement: pointsToUse } },
          });
        }

        // Create transaction with 2-hour payment deadline
        const transaction = await tx.transaction.create({
          data: {
            userId: data.userId,
            eventId: data.eventId,
            totalAmount,
            finalAmount,
            pointsUsed: pointsToUse,
            quantity,
            paymentMethod: data.paymentMethod,
            paymentDeadline,
            status: TransactionStatus.WAITING_PAYMENT,
            promotionId: data.promotionId,
            discountAmount: data.discountAmount || 0,
          },
          include: {
            event: {
              include: {
                organizer: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        });

        return transaction;
      });

      return result;
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Check if it's a constraint violation (seats not available)
      if ((error as any).code === "P2025") {
        return { error: "INSUFFICIENT_SEATS" };
      }

      return null;
    }
  }

  /**
   * Upload payment proof and set confirmation deadline
   */
  async uploadPaymentProof(
    transactionId: string,
    userId: string,
    paymentProof: string
  ): Promise<any | null> {
    try {
      // Find transaction
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId: userId,
          status: TransactionStatus.WAITING_PAYMENT,
        },
      });

      if (!transaction) {
        return null;
      }

      // Check if payment deadline has passed
      if (
        transaction.paymentDeadline &&
        new Date() > transaction.paymentDeadline
      ) {
        // Auto-expire the transaction
        await this.expireTransaction(transactionId);
        return null;
      }

      // Upload to Cloudinary
      let cloudinaryUrl = "";
      try {
        const uploadResponse = await cloudinary.uploader.upload(paymentProof, {
          folder: "payment-proofs",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
          ],
        });
        cloudinaryUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new Error("Failed to upload payment proof");
      }

      // Set confirmation deadline (3 days from now)
      const confirmationDeadline = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      );

      // Update transaction with payment proof
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          paymentProof: cloudinaryUrl,
          // paymentProofBase64: paymentProof, // Temporarily commented due to schema
          status: TransactionStatus.WAITING_CONFIRMATION,
          confirmationDeadline,
        },
        include: {
          event: {
            include: {
              organizer: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      return updatedTransaction;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      return null;
    }
  }

  /**
   * Expire transaction and rollback changes (restore seats and points)
   */
  async expireTransaction(transactionId: string): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return false;
      }

      // Use database transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Restore points to user
        if (transaction.pointsUsed > 0) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: { points: { increment: transaction.pointsUsed } },
          });
        }

        // Restore seats to event
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            availableSeats: { increment: transaction.quantity },
          },
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: TransactionStatus.EXPIRED },
        });
      });

      return true;
    } catch (error) {
      console.error("Error expiring transaction:", error);
      return false;
    }
  }

  /**
   * Reject transaction and rollback changes (restore seats and points)
   */
  async rejectTransaction(transactionId: string): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return false;
      }

      // Use database transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Restore points to user
        if (transaction.pointsUsed > 0) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: { points: { increment: transaction.pointsUsed } },
          });
        }

        // Restore seats to event
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            availableSeats: { increment: transaction.quantity },
          },
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: TransactionStatus.REJECTED },
        });
      });

      return true;
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      return false;
    }
  }

  /**
   * Auto-reject transactions that exceed confirmation deadline (3 days)
   */
  async autoRejectExpiredConfirmations(): Promise<number> {
    try {
      const now = new Date();

      // Find transactions that exceed confirmation deadline
      const expiredTransactions = await prisma.transaction.findMany({
        where: {
          status: TransactionStatus.WAITING_CONFIRMATION,
          confirmationDeadline: { lt: now },
        },
        select: { id: true },
      });

      let rejectedCount = 0;

      // Reject each expired transaction
      for (const transaction of expiredTransactions) {
        const success = await this.rejectTransaction(transaction.id);
        if (success) rejectedCount++;
      }

      return rejectedCount;
    } catch (error) {
      console.error("Error auto-rejecting expired confirmations:", error);
      return 0;
    }
  }

  /**
   * Get expired transactions for auto-expiry job (payment deadline passed)
   */
  async getExpiredPaymentTransactions(): Promise<any[]> {
    return await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        paymentDeadline: { lt: new Date() },
      },
      include: {
        event: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Process expired payment transactions
   */
  async processExpiredPaymentTransactions(): Promise<number> {
    try {
      const expiredTransactions = await this.getExpiredPaymentTransactions();
      let expiredCount = 0;

      for (const transaction of expiredTransactions) {
        const success = await this.expireTransaction(transaction.id);
        if (success) expiredCount++;
      }

      return expiredCount;
    } catch (error) {
      console.error("Error processing expired payment transactions:", error);
      return 0;
    }
  }

  /**
   * Cancel transaction and rollback changes
   */
  async cancelTransaction(id: string, userId?: string): Promise<boolean> {
    try {
      const whereClause: any = { id };

      // If userId provided, ensure user can only cancel their own transactions
      if (userId) {
        whereClause.userId = userId;
      }

      // Check if transaction exists and is not already completed
      const transaction = await prisma.transaction.findUnique({
        where: whereClause,
        select: {
          status: true,
          pointsUsed: true,
          userId: true,
          eventId: true,
          quantity: true,
        },
      });

      if (!transaction || transaction.status === TransactionStatus.DONE) {
        return false;
      }

      // Use database transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Restore points to user
        if (transaction.pointsUsed > 0) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: { points: { increment: transaction.pointsUsed } },
          });
        }

        // Restore seats to event
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            availableSeats: { increment: transaction.quantity },
          },
        });

        // Update transaction status
        await tx.transaction.update({
          where: whereClause,
          data: { status: TransactionStatus.CANCELLED },
        });
      });

      return true;
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      return false;
    }
  }

  // Keep all other existing methods unchanged...
  async getTransactionById(id: string): Promise<any | null> {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    userId?: string
  ): Promise<any | null> {
    try {
      const whereClause: any = { id };

      // If userId provided, ensure user can only update their own transactions
      if (userId) {
        whereClause.userId = userId;
      }

      return await prisma.transaction.update({
        where: whereClause,
        data: { status },
        include: {
          event: {
            include: {
              organizer: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  async completeTransaction(id: string): Promise<boolean> {
    try {
      await prisma.transaction.update({
        where: { id },
        data: { status: TransactionStatus.DONE },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyEventOwnership(
    eventId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true },
      });

      return event?.organizerId === userId;
    } catch (error) {
      console.error("Error verifying event ownership:", error);
      return false;
    }
  }

  // Add other existing methods as needed...
  async getTransactionsByEvent(eventId: string) {
    return await prisma.transaction.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getTransactionsByUser(
    userId: string,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              organizer: {
                select: { id: true, fullName: true, email: true },
              },
              promotion: {
                select: { id: true, code: true, discountPercent: true },
              },
            },
          },
          promotion: {
            select: { id: true, code: true, discountPercent: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return {
      data: transactions.map((transaction) => ({
        id: transaction.id,
        totalAmount: transaction.totalAmount,
        pointsUsed: transaction.pointsUsed,
        discountAmount: transaction.discountAmount,
        finalAmount: transaction.finalAmount,
        paymentMethod: transaction.paymentMethod,
        paymentProof: transaction.paymentProof,
        status: transaction.status,
        paymentDeadline: transaction.paymentDeadline,
        confirmationDeadline: transaction.confirmationDeadline,
        notes: transaction.notes,
        quantity: transaction.quantity,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        event: {
          id: transaction.event.id,
          title: transaction.event.title,
          description: transaction.event.description,
          category: transaction.event.category,
          location: transaction.event.location,
          startDate: transaction.event.startDate,
          endDate: transaction.event.endDate,
          price: transaction.event.price,
          image: transaction.event.image,
          status: transaction.event.status,
          organizer: transaction.event.organizer,
          promotion: transaction.event.promotion,
        },
        promotion: transaction.promotion,
        // Helper fields for UI
        canCancel:
          ["WAITING_PAYMENT", "WAITING_CONFIRMATION"].includes(
            transaction.status
          ) &&
          (!transaction.paymentDeadline ||
            transaction.paymentDeadline > new Date()),
        canUploadPayment:
          transaction.status === "WAITING_PAYMENT" &&
          (!transaction.paymentDeadline ||
            transaction.paymentDeadline > new Date()),
        canReview:
          transaction.status === "DONE" &&
          new Date() > transaction.event.endDate,
        isExpired:
          transaction.paymentDeadline &&
          transaction.paymentDeadline < new Date(),
        eventStatus:
          transaction.event.startDate > new Date()
            ? "UPCOMING"
            : transaction.event.endDate < new Date()
            ? "ENDED"
            : "ONGOING",
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async isUserRegistered(userId: string, eventId: string): Promise<boolean> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: {
          in: [
            TransactionStatus.WAITING_PAYMENT,
            TransactionStatus.WAITING_CONFIRMATION,
            TransactionStatus.DONE,
          ],
        },
      },
    });

    return !!transaction;
  }

  async getAllTransactions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        include: {
          event: {
            select: { id: true, title: true },
          },
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count(),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionStats() {
    const [total, waitingPayment, waitingConfirm, done, cancelled] =
      await Promise.all([
        prisma.transaction.count(),
        prisma.transaction.count({
          where: { status: TransactionStatus.WAITING_PAYMENT },
        }),
        prisma.transaction.count({
          where: { status: TransactionStatus.WAITING_CONFIRMATION },
        }),
        prisma.transaction.count({ where: { status: TransactionStatus.DONE } }),
        prisma.transaction.count({
          where: { status: TransactionStatus.CANCELLED },
        }),
      ]);

    return {
      total,
      waitingPayment,
      waitingConfirm,
      done,
      cancelled,
    };
  }

  async getMyTickets(userId: string): Promise<any[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      event: {
        id: transaction.event.id,
        title: transaction.event.title,
        description: transaction.event.description,
        location: transaction.event.location,
        startDate: transaction.event.startDate,
        endDate: transaction.event.endDate,
        image: transaction.event.image,
        organizer: {
          id: transaction.event.organizer.id,
          fullName: transaction.event.organizer.fullName || "Unknown",
        },
      },
      finalAmount: transaction.finalAmount,
      status: transaction.status,
      paymentDeadline: transaction.paymentDeadline,
      paymentProof: transaction.paymentProof,
      createdAt: transaction.createdAt,
      canReview:
        transaction.status === TransactionStatus.DONE &&
        new Date() > transaction.event.endDate,
    }));
  }
}

export const transactionService = new TransactionService();
