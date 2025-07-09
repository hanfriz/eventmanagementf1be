-- Drop Database Script
-- This script drops all tables and sequences in the correct order

-- Drop all tables in correct order (considering foreign key constraints)
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Event" CASCADE;
DROP TABLE IF EXISTS "Promotion" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop Prisma migration table if needed
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS "User_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Event_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Promotion_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Transaction_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Review_id_seq" CASCADE;

-- Drop any custom types/enums (now safe after tables are dropped)
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "EventCategory" CASCADE;
DROP TYPE IF EXISTS "EventStatus" CASCADE;
DROP TYPE IF EXISTS "TransactionStatus" CASCADE;

-- Print success message
SELECT 'Database tables dropped successfully!' as message;
