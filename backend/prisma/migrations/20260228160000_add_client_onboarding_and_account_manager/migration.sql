-- Add all new columns to clients table
ALTER TABLE "clients"
ADD COLUMN "accountManagerId" TEXT,
ADD COLUMN "tier" TEXT,
ADD COLUMN "contactFirstName" TEXT,
ADD COLUMN "contactLastName" TEXT,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "fromFieldName" TEXT,
ADD COLUMN "companyDescription" TEXT,
ADD COLUMN "idealCustomer" TEXT,
ADD COLUMN "coreProducts" TEXT,
ADD COLUMN "peakSeasonPriorities" TEXT,
ADD COLUMN "yearRoundOffers" TEXT,
ADD COLUMN "businessStory" TEXT,
ADD COLUMN "uniqueValue" TEXT,
ADD COLUMN "productTransformation" TEXT,
ADD COLUMN "domainHost" TEXT,
ADD COLUMN "domainHostOther" TEXT,
ADD COLUMN "hasDomainAccess" BOOLEAN,
ADD COLUMN "domainAccessContact" TEXT,
ADD COLUMN "hasEmailPlatform" BOOLEAN,
ADD COLUMN "emailPlatform" TEXT,
ADD COLUMN "emailPlatformOther" TEXT,
ADD COLUMN "marketingEmail" TEXT,
ADD COLUMN "hasEmailAdminAccess" BOOLEAN,
ADD COLUMN "emailAdminContact" TEXT,
ADD COLUMN "approverFirstName" TEXT,
ADD COLUMN "approverLastName" TEXT,
ADD COLUMN "approverEmail" TEXT,
ADD COLUMN "approvalMethod" TEXT,
ADD COLUMN "canSendWithoutApproval" BOOLEAN;

-- Add FK constraint and index for accountManagerId
ALTER TABLE "clients" ADD CONSTRAINT "clients_accountManagerId_fkey"
  FOREIGN KEY ("accountManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "clients_accountManagerId_idx" ON "clients"("accountManagerId");

-- Create 3 account manager users (role: MANAGER)
-- Password: Prolific2026! (bcrypt hash)
INSERT INTO "users" ("id", "email", "passwordHash", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'zac@prolificbranddesign.com', '$2a$10$dmbo5wrBRFrnj96BOLNyheAgzrY2mJDEow7nmwXRjyVeBU2yQjBJm', 'Zac', 'Garside', 'MANAGER', true, NOW(), NOW()),
  (gen_random_uuid(), 'andrew@prolificbranddesign.com', '$2a$10$dmbo5wrBRFrnj96BOLNyheAgzrY2mJDEow7nmwXRjyVeBU2yQjBJm', 'Andrew', 'Carlson', 'MANAGER', true, NOW(), NOW()),
  (gen_random_uuid(), 'pat@prolificbranddesign.com', '$2a$10$dmbo5wrBRFrnj96BOLNyheAgzrY2mJDEow7nmwXRjyVeBU2yQjBJm', 'Pat', 'Garza', 'MANAGER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Backfill accountManagerId from contextMarkdown
UPDATE "clients" SET "accountManagerId" = (
  SELECT "id" FROM "users" WHERE "email" = 'zac@prolificbranddesign.com' LIMIT 1
) WHERE "contextMarkdown" LIKE '%Account Manager:** Zac Garside%';

UPDATE "clients" SET "accountManagerId" = (
  SELECT "id" FROM "users" WHERE "email" = 'andrew@prolificbranddesign.com' LIMIT 1
) WHERE "contextMarkdown" LIKE '%Account Manager:** Andrew Carlson%';

UPDATE "clients" SET "accountManagerId" = (
  SELECT "id" FROM "users" WHERE "email" = 'pat@prolificbranddesign.com' LIMIT 1
) WHERE "contextMarkdown" LIKE '%Account Manager:** Pat Garza%';

-- Backfill tier from contextMarkdown
UPDATE "clients" SET "tier" = 'Tier 1' WHERE "contextMarkdown" LIKE '%Tier 1%';
UPDATE "clients" SET "tier" = 'Tier 2' WHERE "contextMarkdown" LIKE '%Tier 2%';
UPDATE "clients" SET "tier" = 'Tier 3' WHERE "contextMarkdown" LIKE '%Tier 3%';

-- Backfill contactEmail from contextMarkdown
UPDATE "clients" SET "contactEmail" = trim(substring("contextMarkdown" from 'Contact Email:\*\*\s*([^\s\n]+)'))
WHERE "contactEmail" IS NULL AND "contextMarkdown" LIKE '%Contact Email:%';
