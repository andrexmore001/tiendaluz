-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "isCustomizable" BOOLEAN NOT NULL DEFAULT false,
    "textX" REAL NOT NULL DEFAULT 50,
    "textY" REAL NOT NULL DEFAULT 50,
    "rotation" REAL NOT NULL DEFAULT 0,
    "scale" REAL NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductImage" ("id", "productId", "rotation", "scale", "textX", "textY", "url") SELECT "id", "productId", "rotation", "scale", "textX", "textY", "url" FROM "ProductImage";
DROP TABLE "ProductImage";
ALTER TABLE "new_ProductImage" RENAME TO "ProductImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
