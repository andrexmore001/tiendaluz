-- AlterTable: Add opportunityName to Quote
ALTER TABLE "Quote" ADD COLUMN "opportunityName" TEXT;

-- AlterTable: Add opportunityName to Order
ALTER TABLE "Order" ADD COLUMN "opportunityName" TEXT;
