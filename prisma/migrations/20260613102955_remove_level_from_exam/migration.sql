/*
  Warnings:

  - You are about to drop the column `level` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "level",
DROP COLUMN "year";

-- AlterTable
ALTER TABLE "public"."Exam" DROP COLUMN "level";
