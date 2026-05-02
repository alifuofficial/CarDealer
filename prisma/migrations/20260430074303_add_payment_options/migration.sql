-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BANK',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chassisNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "modelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarUnit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarUnit" ("chassisNumber", "createdAt", "id", "modelId", "status", "updatedAt") SELECT "chassisNumber", "createdAt", "id", "modelId", "status", "updatedAt" FROM "CarUnit";
DROP TABLE "CarUnit";
ALTER TABLE "new_CarUnit" RENAME TO "CarUnit";
CREATE UNIQUE INDEX "CarUnit_chassisNumber_key" ON "CarUnit"("chassisNumber");
CREATE TABLE "new_Proforma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "carUnitId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "bankId" TEXT,
    "advancePayment" REAL NOT NULL DEFAULT 0,
    "creditAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proforma_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proforma_carUnitId_fkey" FOREIGN KEY ("carUnitId") REFERENCES "CarUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proforma_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Proforma_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Proforma" ("amount", "carUnitId", "createdAt", "createdById", "customerId", "id", "number", "status", "updatedAt") SELECT "amount", "carUnitId", "createdAt", "createdById", "customerId", "id", "number", "status", "updatedAt" FROM "Proforma";
DROP TABLE "Proforma";
ALTER TABLE "new_Proforma" RENAME TO "Proforma";
CREATE UNIQUE INDEX "Proforma_number_key" ON "Proforma"("number");
CREATE UNIQUE INDEX "Proforma_carUnitId_key" ON "Proforma"("carUnitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_key" ON "Bank"("name");
