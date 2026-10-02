-- This migration cannot be run inside a transaction.
ALTER TYPE "Sport" ADD VALUE 'ALTRO';
ALTER TABLE "Asd" ADD COLUMN "sportCustomLabel" TEXT;
