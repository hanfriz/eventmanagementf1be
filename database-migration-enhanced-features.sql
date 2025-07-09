-- Migration script to ensure all required fields exist for enhanced features
-- Run this if you need to update existing database schema

-- Check if points column exists in users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'points'
    ) THEN
        ALTER TABLE "User" ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
END $$;

-- Check if availableSeats column exists in events table  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Event' AND column_name = 'availableSeats'
    ) THEN
        ALTER TABLE "Event" ADD COLUMN "availableSeats" INTEGER;
        -- Initialize availableSeats to totalSeats for existing events
        UPDATE "Event" SET "availableSeats" = "totalSeats" WHERE "availableSeats" IS NULL;
    END IF;
END $$;

-- Check if quantity column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Check if pointsUsed column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'pointsUsed'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "pointsUsed" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Check if paymentDeadline column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'paymentDeadline'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "paymentDeadline" TIMESTAMP;
    END IF;
END $$;

-- Check if confirmationDeadline column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'confirmationDeadline'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "confirmationDeadline" TIMESTAMP;
    END IF;
END $$;

-- Ensure Review table has proper unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Review_userId_eventId_key'
    ) THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_eventId_key" UNIQUE ("userId", "eventId");
    END IF;
EXCEPTION WHEN duplicate_table THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Update any NULL points to 0
UPDATE "User" SET points = 0 WHERE points IS NULL;

-- Update any NULL availableSeats to totalSeats
UPDATE "Event" SET "availableSeats" = "totalSeats" WHERE "availableSeats" IS NULL;

-- Update any NULL quantity to 1
UPDATE "Transaction" SET quantity = 1 WHERE quantity IS NULL;

-- Update any NULL pointsUsed to 0
UPDATE "Transaction" SET "pointsUsed" = 0 WHERE "pointsUsed" IS NULL;

COMMIT;
