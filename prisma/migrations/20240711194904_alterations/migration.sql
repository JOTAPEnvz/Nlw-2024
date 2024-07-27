/*
  Warnings:

  - You are about to drop the column `created_at` on the `participantes` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `participantes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_participantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "participantes_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_participantes" ("email", "id", "name", "tripId") SELECT "email", "id", "name", "tripId" FROM "participantes";
DROP TABLE "participantes";
ALTER TABLE "new_participantes" RENAME TO "participantes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
