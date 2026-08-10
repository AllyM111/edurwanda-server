/*
  Warnings:

  - Added the required column `updatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'PAST_PAPER',
ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'QUESTIONS_AND_ANSWERS',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'EduRwanda',
    "siteDescription" TEXT NOT NULL DEFAULT 'Rwanda National Education Platform',
    "siteEmail" TEXT,
    "sitePhone" TEXT,
    "siteAddress" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "primaryColor" TEXT NOT NULL DEFAULT 'blue',
    "language" TEXT NOT NULL DEFAULT 'English',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "allowBookDownloads" BOOLEAN NOT NULL DEFAULT true,
    "allowExamDownloads" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maxUploadSize" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
