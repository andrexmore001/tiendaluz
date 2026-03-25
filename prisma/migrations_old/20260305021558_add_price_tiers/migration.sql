-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site-settings',
    "title" TEXT NOT NULL DEFAULT 'Artesana',
    "slug" TEXT NOT NULL DEFAULT 'artesana',
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E8A2A2',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F9F1E7',
    "accentColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "phone" TEXT NOT NULL DEFAULT '+57 300 000 0000',
    "email" TEXT NOT NULL DEFAULT 'contacto@artesana.com',
    "address" TEXT NOT NULL DEFAULT 'Calle Falsa 123, Bogotá',
    "instagram" TEXT NOT NULL DEFAULT 'https://instagram.com/artesana',
    "facebook" TEXT NOT NULL DEFAULT 'https://facebook.com/artesana',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "boxTexture" TEXT,
    "displayMode" TEXT NOT NULL DEFAULT '3d',
    "width" REAL NOT NULL DEFAULT 4,
    "height" REAL NOT NULL DEFAULT 2,
    "depth" REAL NOT NULL DEFAULT 4,
    "boxType" TEXT NOT NULL DEFAULT 'standard',
    "materialId" TEXT NOT NULL DEFAULT 'carton-kraft',
    "baseColor" TEXT NOT NULL DEFAULT '#F9F1E7',
    "materialTexture" TEXT,
    "shapeId" TEXT,
    "hingeEdge" TEXT NOT NULL DEFAULT 'long',
    "flapsLocation" TEXT NOT NULL DEFAULT 'base',
    "flapHeightPercent" REAL NOT NULL DEFAULT 0.25,
    "flapWidthOffset" REAL NOT NULL DEFAULT -0.2,
    "flapType" TEXT NOT NULL DEFAULT 'rectangular',
    "tuckFlapHeightPercent" REAL NOT NULL DEFAULT 0.15,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER,
    "unitPrice" REAL NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "PriceTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "textX" REAL NOT NULL DEFAULT 50,
    "textY" REAL NOT NULL DEFAULT 50,
    "rotation" REAL NOT NULL DEFAULT 0,
    "scale" REAL NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'corrugated',
    "thickness_mm" REAL NOT NULL DEFAULT 4,
    "tolerance_mm" REAL NOT NULL DEFAULT 1,
    "stiffness_factor" REAL NOT NULL DEFAULT 0.08,
    "textureUrl" TEXT,
    "baseColor" TEXT NOT NULL DEFAULT '#e3c5a8',
    "roughness" REAL NOT NULL DEFAULT 0.9,
    "metalness" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "BoxShape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "depth" REAL NOT NULL,
    "hingeEdge" TEXT NOT NULL DEFAULT 'long',
    "flapsLocation" TEXT NOT NULL DEFAULT 'base',
    "flapHeightPercent" REAL NOT NULL DEFAULT 0.25,
    "flapWidthOffset" REAL NOT NULL DEFAULT -0.2,
    "flapType" TEXT NOT NULL DEFAULT 'rectangular',
    "tuckFlapHeightPercent" REAL NOT NULL DEFAULT 0.15
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_key" ON "Collection"("name");
