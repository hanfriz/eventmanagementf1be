import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function dropDatabase() {
  try {
    console.log("🗑️  Starting database drop...");

    // Drop tables in correct order (reverse of dependencies)
    const dropQueries = [
      'DROP TABLE IF EXISTS "Review" CASCADE;',
      'DROP TABLE IF EXISTS "Transaction" CASCADE;',
      'DROP TABLE IF EXISTS "Event" CASCADE;',
      'DROP TABLE IF EXISTS "Promotion" CASCADE;',
      'DROP TABLE IF EXISTS "User" CASCADE;',
      'DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;',

      // Drop sequences
      'DROP SEQUENCE IF EXISTS "User_id_seq" CASCADE;',
      'DROP SEQUENCE IF EXISTS "Event_id_seq" CASCADE;',
      'DROP SEQUENCE IF EXISTS "Promotion_id_seq" CASCADE;',
      'DROP SEQUENCE IF EXISTS "Transaction_id_seq" CASCADE;',
      'DROP SEQUENCE IF EXISTS "Review_id_seq" CASCADE;',

      // Drop custom types/enums
      'DROP TYPE IF EXISTS "Role" CASCADE;',
      'DROP TYPE IF EXISTS "EventCategory" CASCADE;',
      'DROP TYPE IF EXISTS "EventStatus" CASCADE;',
      'DROP TYPE IF EXISTS "TransactionStatus" CASCADE;',
    ];

    for (const query of dropQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Executed: ${query}`);
      } catch (error) {
        console.log(`⚠️  Warning: ${query} - ${error.message}`);
      }
    }

    console.log("✅ Database drop completed successfully!");
  } catch (error) {
    console.error("❌ Error dropping database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

dropDatabase();
