import cron from "node-cron";
import { prisma } from "../config/database";
import { config } from "../config";
import { transactionService } from "../services/transaction.service";
import { TransactionStatus } from "@prisma/client";

/**
 * Update event status based on dates
 */
export const updateEventStatus = async () => {
  try {
    const now = new Date();

    // Update events to ACTIVE if start date has passed
    await prisma.event.updateMany({
      where: {
        status: "UPCOMING",
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      data: {
        status: "ACTIVE",
      },
    });

    // Update events to ENDED if end date has passed
    await prisma.event.updateMany({
      where: {
        status: {
          in: ["UPCOMING", "ACTIVE"],
        },
        endDate: {
          lt: now,
        },
      },
      data: {
        status: "ENDED",
      },
    });

    console.log(`✅ Event status updated at ${now.toISOString()}`);
  } catch (error) {
    console.error("❌ Error updating event status:", error);
  }
};

/**
 * Clean up expired transactions with rollback
 */
export const cleanupExpiredTransactions = async () => {
  try {
    const now = new Date();
    console.log(
      `🔄 Starting expired transaction cleanup at ${now.toISOString()}`
    );

    // Get all expired payment transactions
    const expiredTransactions =
      await transactionService.getExpiredPaymentTransactions();

    let expiredCount = 0;
    for (const transaction of expiredTransactions) {
      const success = await transactionService.expireTransaction(
        transaction.id
      );
      if (success) {
        expiredCount++;
        console.log(
          `   ✅ Expired transaction ${transaction.id} for event: ${transaction.event.title}`
        );
      }
    }

    console.log(
      `✅ ${expiredCount} expired transactions processed at ${now.toISOString()}`
    );
  } catch (error) {
    console.error("❌ Error cleaning up expired transactions:", error);
  }
};

/**
 * Auto-reject transactions that have exceeded confirmation deadline (3 days)
 */
export const autoRejectExpiredConfirmations = async () => {
  try {
    const now = new Date();

    console.log(
      `🔄 Starting auto-reject for expired confirmations at ${now.toISOString()}`
    );

    // Use the enhanced transaction service method
    const rejectedCount =
      await transactionService.autoRejectExpiredConfirmations();

    console.log(
      `✅ ${rejectedCount} expired confirmation transactions auto-rejected at ${now.toISOString()}`
    );
  } catch (error) {
    console.error("❌ Error auto-rejecting expired confirmations:", error);
  }
};

/**
 * Deactivate expired promotions
 */
export const deactivateExpiredPromotions = async () => {
  try {
    const now = new Date();

    const result = await prisma.promotion.updateMany({
      where: {
        isActive: true,
        validUntil: {
          lt: now,
        },
      },
      data: {
        isActive: false,
      },
    });

    console.log(
      `✅ ${
        result.count
      } expired promotions deactivated at ${now.toISOString()}`
    );
  } catch (error) {
    console.error("❌ Error deactivating expired promotions:", error);
  }
};

/**
 * Initialize and start all cron jobs
 */
export const initializeCronJobs = () => {
  if (!config.cronJobs.enabled) {
    console.log("🔄 Cron jobs are disabled");
    return;
  }

  console.log("🔄 Initializing cron jobs...");

  // Update event status every 5 minutes
  cron.schedule("*/5 * * * *", updateEventStatus, {
    timezone: config.cronJobs.timezone,
  });

  // Clean up expired transactions every 10 minutes
  cron.schedule("*/10 * * * *", cleanupExpiredTransactions, {
    timezone: config.cronJobs.timezone,
  });

  // Auto-reject expired confirmations every hour
  cron.schedule("0 * * * *", autoRejectExpiredConfirmations, {
    timezone: config.cronJobs.timezone,
  });

  // Deactivate expired promotions every hour
  cron.schedule("0 * * * *", deactivateExpiredPromotions, {
    timezone: config.cronJobs.timezone,
  });

  console.log(
    `✅ Cron jobs initialized with timezone: ${config.cronJobs.timezone}`
  );
};
