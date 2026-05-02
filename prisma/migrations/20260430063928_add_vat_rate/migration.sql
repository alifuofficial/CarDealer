-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'Alif Soreti Car Dealer',
    "tin" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "vatRate" REAL NOT NULL DEFAULT 15.0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Organization" ("address", "id", "logoUrl", "name", "phone", "tin", "updatedAt", "website") SELECT "address", "id", "logoUrl", "name", "phone", "tin", "updatedAt", "website" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
