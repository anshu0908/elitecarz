-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Make" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT
);

-- CreateTable
CREATE TABLE "Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "makeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bodyType" TEXT,
    CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fuel" TEXT,
    "transmission" TEXT,
    "engine" TEXT,
    CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "stockNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "makeId" INTEGER,
    "modelId" INTEGER,
    "variantId" INTEGER,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "registrationYear" INTEGER,
    "fuel" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "bodyType" TEXT,
    "kmDriven" INTEGER,
    "owners" INTEGER,
    "color" TEXT,
    "seats" INTEGER,
    "rto" TEXT,
    "regNumber" TEXT,
    "regNumberMasked" TEXT,
    "insuranceType" TEXT,
    "insuranceValidTill" DATETIME,
    "priceInr" INTEGER NOT NULL,
    "tcsApplicable" BOOLEAN NOT NULL DEFAULT true,
    "mrpNote" TEXT,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "warrantyIncluded" BOOLEAN NOT NULL DEFAULT false,
    "warrantyMonths" INTEGER,
    "warrantyKm" INTEGER,
    "warrantyNote" TEXT,
    "engineCc" INTEGER,
    "powerBhp" REAL,
    "mileageKmpl" REAL,
    "description" TEXT,
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '[]',
    "disclosures" TEXT NOT NULL DEFAULT '[]',
    "videoUrl" TEXT,
    "view360Url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "heroImageId" TEXT,
    "purchasePriceInr" INTEGER,
    "refurbCostInr" INTEGER,
    "source" TEXT,
    "notesInternal" TEXT,
    "demoFields" TEXT NOT NULL DEFAULT '[]',
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "soldAt" DATETIME,
    "soldPriceInr" INTEGER,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Car_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Car_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Car_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Car_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "alt" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CarDocument_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "inspectedBy" TEXT,
    "inspectedOn" DATETIME,
    "overallScore" REAL,
    "summary" TEXT,
    "reportPdfUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Inspection_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "note" TEXT,
    "photoUrl" TEXT,
    CONSTRAINT "InspectionItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carId" TEXT NOT NULL,
    "oldPrice" INTEGER NOT NULL,
    "newPrice" INTEGER NOT NULL,
    "changedById" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "name" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "city" TEXT,
    "carId" TEXT,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "message" TEXT,
    "source" TEXT,
    "utm" TEXT,
    "pageUrl" TEXT,
    "assignedToId" TEXT,
    "nextFollowupAt" DATETIME,
    "lostReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SellRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "regNumber" TEXT,
    "make" TEXT,
    "model" TEXT,
    "variant" TEXT,
    "mfgYear" INTEGER,
    "regYear" INTEGER,
    "owners" INTEGER,
    "kmRange" TEXT,
    "fuel" TEXT,
    "transmission" TEXT,
    "state" TEXT,
    "expectedPrice" INTEGER,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "offeredMin" INTEGER,
    "offeredMax" INTEGER,
    "inspectionSlot" DATETIME,
    "outcome" TEXT,
    CONSTRAINT "SellRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "carId" TEXT,
    "kind" TEXT NOT NULL,
    "slot" DATETIME,
    "tokenAmount" INTEGER,
    "paymentStatus" TEXT,
    "paymentRef" TEXT,
    "refundStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google',
    "isParaphrase" BOOLEAN NOT NULL DEFAULT true,
    "carLabel" TEXT,
    "photoUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "reviewedOn" TEXT
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "bodyMd" TEXT,
    "coverUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "startsOn" DATETIME,
    "endsOn" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "minRate" REAL NOT NULL,
    "maxRate" REAL NOT NULL,
    "maxTenureMonths" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "code" INTEGER NOT NULL DEFAULT 301,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "diff" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_makeId_name_key" ON "Model"("makeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_modelId_name_key" ON "Variant"("modelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Car_stockNo_key" ON "Car"("stockNo");

-- CreateIndex
CREATE INDEX "Car_status_priceInr_idx" ON "Car"("status", "priceInr");

-- CreateIndex
CREATE INDEX "Car_makeId_modelId_idx" ON "Car"("makeId", "modelId");

-- CreateIndex
CREATE INDEX "Car_deletedAt_idx" ON "Car"("deletedAt");

-- CreateIndex
CREATE INDEX "CarImage_carId_sortOrder_idx" ON "CarImage"("carId", "sortOrder");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_fromPath_key" ON "Redirect"("fromPath");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
