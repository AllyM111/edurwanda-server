/*
  Warnings:

  - The primary key for the `Exam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Exam` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_pkey",
ADD COLUMN     "level" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "year" DROP NOT NULL,
ADD CONSTRAINT "Exam_pkey" PRIMARY KEY ("id");
