-- CreateEnum
CREATE TYPE "Ownership" AS ENUM ('USERNAME', 'ERC1400');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "ownership" "Ownership" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);