/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Book` table. All the data in the column will be lost.
  - Added the required column `pdfUrl` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "fileUrl",
ADD COLUMN     "author" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "pdfUrl" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER;
