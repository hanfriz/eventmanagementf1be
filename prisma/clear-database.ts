import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🗑️ Starting database cleanup...");

  try {
    // Delete in correct order to avoid foreign key constraint errors
    console.log("Deleting reviews...");
    const reviewsDeleted = await prisma.review.deleteMany();
    console.log(`✓ Deleted ${reviewsDeleted.count} reviews`);

    console.log("Deleting transactions...");
    const transactionsDeleted = await prisma.transaction.deleteMany();
    console.log(`✓ Deleted ${transactionsDeleted.count} transactions`);

    console.log("Deleting events...");
    const eventsDeleted = await prisma.event.deleteMany();
    console.log(`✓ Deleted ${eventsDeleted.count} events`);

    console.log("Deleting promotions...");
    const promotionsDeleted = await prisma.promotion.deleteMany();
    console.log(`✓ Deleted ${promotionsDeleted.count} promotions`);

    console.log("Deleting users...");
    const usersDeleted = await prisma.user.deleteMany();
    console.log(`✓ Deleted ${usersDeleted.count} users`);

    const totalDeleted =
      reviewsDeleted.count +
      transactionsDeleted.count +
      eventsDeleted.count +
      promotionsDeleted.count +
      usersDeleted.count;

    console.log(`\n✅ Database cleared successfully!`);
    console.log(`📊 Total records deleted: ${totalDeleted}`);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
clearDatabase().catch((error) => {
  console.error("Fatal error:", error);
});

export default clearDatabase;
