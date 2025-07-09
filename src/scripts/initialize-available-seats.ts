import { prisma } from "../config/database";
import { TransactionStatus } from "@prisma/client";

/**
 * Script to initialize availableSeats for existing events
 */
async function initializeAvailableSeats() {
  try {
    console.log("🔄 Initializing available seats for existing events...");

    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        totalSeats: true,
        availableSeats: true,
        _count: {
          select: {
            transactions: {
              where: {
                status: {
                  notIn: [
                    TransactionStatus.CANCELLED,
                    TransactionStatus.REJECTED,
                    TransactionStatus.EXPIRED,
                  ],
                },
              },
            },
          },
        },
      },
    });

    let updatedCount = 0;

    for (const event of events) {
      const bookedSeats = event._count.transactions;
      const correctAvailableSeats = event.totalSeats - bookedSeats;

      // Only update if availableSeats is incorrect
      if (event.availableSeats !== correctAvailableSeats) {
        await prisma.event.update({
          where: { id: event.id },
          data: { availableSeats: correctAvailableSeats },
        });

        console.log(
          `✅ Updated "${event.title}": ${event.availableSeats} → ${correctAvailableSeats} available seats`
        );
        updatedCount++;
      } else {
        console.log(
          `✓ "${event.title}": ${event.availableSeats} available seats (already correct)`
        );
      }
    }

    console.log(
      `\n✅ Completed! Updated ${updatedCount} out of ${events.length} events.`
    );
  } catch (error) {
    console.error("❌ Error initializing available seats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  initializeAvailableSeats().catch(console.error);
}

export { initializeAvailableSeats };
