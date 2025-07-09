import { PrismaClient } from "@prisma/client";

declare const process: {
  env: { [key: string]: string | undefined };
};

const prisma = new PrismaClient();

async function clearDatabaseWithConfirmation() {
  console.log("⚠️  WARNING: This will delete ALL data in the database!");
  console.log("This action cannot be undone.\n");

  try {
    // Get counts before deletion
    const counts = {
      reviews: await prisma.review.count(),
      transactions: await prisma.transaction.count(),
      events: await prisma.event.count(),
      promotions: await prisma.promotion.count(),
      users: await prisma.user.count(),
    };

    console.log("Current data in database:");
    console.log(`- Users: ${counts.users}`);
    console.log(`- Events: ${counts.events}`);
    console.log(`- Promotions: ${counts.promotions}`);
    console.log(`- Transactions: ${counts.transactions}`);
    console.log(`- Reviews: ${counts.reviews}`);
    console.log(
      `- Total records: ${Object.values(counts).reduce((a, b) => a + b, 0)}\n`
    );

    // Check for environment confirmation
    const confirmDelete = process.env.CONFIRM_DELETE;
    if (confirmDelete !== "YES") {
      console.log("❌ Operation cancelled.");
      console.log(
        "To confirm deletion, run: CONFIRM_DELETE=YES npm run db:clear:confirm"
      );
      return;
    }

    console.log("🗑️ Starting database cleanup...");

    // Delete in correct order
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

    console.log("\n✅ Database cleared successfully!");
    console.log(`📊 Total records deleted: ${totalDeleted}`);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
clearDatabaseWithConfirmation();
