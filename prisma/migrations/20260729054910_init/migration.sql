-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('CALCIO', 'NUOTO', 'PALLAVOLO', 'BASKET', 'TENNIS', 'ARTI_MARZIALI', 'ATLETICA');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'BILLABLE', 'FREE_QUOTA');

-- CreateEnum
CREATE TYPE "EnrolleeType" AS ENUM ('SELF', 'CHILD');

-- CreateTable
CREATE TABLE "Asd" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscriptionSince" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsdCategory" (
    "id" TEXT NOT NULL,
    "asdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "hours" TEXT NOT NULL,
    "annualFee" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsdCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "asdId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "asdId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "enrolleeType" "EnrolleeType" NOT NULL DEFAULT 'CHILD',
    "enrolleeAge" INTEGER,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asd_email_key" ON "Asd"("email");

-- AddForeignKey
ALTER TABLE "AsdCategory" ADD CONSTRAINT "AsdCategory_asdId_fkey" FOREIGN KEY ("asdId") REFERENCES "Asd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_asdId_fkey" FOREIGN KEY ("asdId") REFERENCES "Asd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_asdId_fkey" FOREIGN KEY ("asdId") REFERENCES "Asd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
