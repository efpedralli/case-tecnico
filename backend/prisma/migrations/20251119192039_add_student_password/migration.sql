/*
  Warnings:

  - Changed the type of `type` on the `Environment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EnvironmentType" AS ENUM ('sala', 'laboratorio', 'estudos');

-- DropIndex
DROP INDEX "Student_name_key";

-- AlterTable
ALTER TABLE "Environment" DROP COLUMN "type",
ADD COLUMN     "type" "EnvironmentType" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "passwordHash" TEXT;
