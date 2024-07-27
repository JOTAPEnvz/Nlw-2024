-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_participantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Convidado',
    "email" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "participantes_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_participantes" ("email", "id", "is_confirmed", "is_owner", "name", "tripId") SELECT "email", "id", "is_confirmed", "is_owner", "name", "tripId" FROM "participantes";
DROP TABLE "participantes";
ALTER TABLE "new_participantes" RENAME TO "participantes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
