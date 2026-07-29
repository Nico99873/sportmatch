/*
  Warnings:

  - You are about to drop the column `billed` on the `ContactRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ContactRequest` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SubscriptionPlan" ADD VALUE 'BASE';

-- AlterTable
ALTER TABLE "Asd" ADD COLUMN     "profileViewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ContactRequest" DROP COLUMN "billed",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "asdReply" TEXT,
ADD COLUMN     "asdReplyAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "ContactStatus";
