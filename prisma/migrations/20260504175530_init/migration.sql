-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'ROYAL NLK SILKS',
    "address" TEXT NOT NULL DEFAULT 'Shanthi Nagar, Dharmavaram - 515671',
    "phone" TEXT NOT NULL DEFAULT '8282824929',
    "email" TEXT NOT NULL DEFAULT 'royalnlksilks@gmail.com',
    "instagram" TEXT NOT NULL DEFAULT 'https://www.instagram.com/royal_nlksilks_dmm',
    "whatsapp" TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ',
    "logoUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#C9972B',
    "upiQrUrl" TEXT,
    "upiId" TEXT,
    "paymentInstructions" TEXT,
    "heroImage" TEXT,
    "heroHeadline" TEXT NOT NULL DEFAULT 'Royal Elegance in Every Thread',
    "heroSubtext" TEXT NOT NULL DEFAULT 'Discover the finest Handloom Silk Sarees from Dharmavaram',
    "heroCTA" TEXT NOT NULL DEFAULT 'Shop Now',
    "announcementText" TEXT NOT NULL DEFAULT 'Free delivery on orders above ₹999',
    "announcementVisible" BOOLEAN NOT NULL DEFAULT true,
    "aboutText" TEXT,
    "aboutImage" TEXT
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentScreenshotUrl" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "orderStatus" TEXT NOT NULL DEFAULT 'processing',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
