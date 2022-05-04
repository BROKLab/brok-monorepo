-- CreateTable
CREATE TABLE "CapTable" (
    "address" TEXT NOT NULL,
    "boardDirectorAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapTable_pkey" PRIMARY KEY ("address")
);
