import { PrismaClient } from "@prisma/client";

// Create a global variable to store the Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma instance
export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, store the instance globally to prevent hot reload issues
if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
