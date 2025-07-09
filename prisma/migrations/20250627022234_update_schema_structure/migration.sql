/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - Changed the type of `category` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('TECHNOLOGY', 'BUSINESS', 'EDUCATION', 'ENTERTAINMENT', 'SPORTS', 'HEALTH', 'FOOD', 'TRAVEL', 'ART', 'MUSIC', 'OTHER');

-- AlterTable
ALTER TABLE "events" DROP COLUMN "category",
ADD COLUMN     "category" "EventCategory" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" "UserGender",
ADD COLUMN     "profilePicture" TEXT;
