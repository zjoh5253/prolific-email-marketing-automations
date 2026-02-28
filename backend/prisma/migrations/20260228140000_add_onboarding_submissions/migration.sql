-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'CONVERTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "onboarding_submissions" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "fromFieldName" TEXT,
    "companyDescription" TEXT,
    "idealCustomer" TEXT,
    "coreProducts" TEXT,
    "peakSeasonPriorities" TEXT,
    "yearRoundOffers" TEXT,
    "businessStory" TEXT,
    "uniqueValue" TEXT,
    "productTransformation" TEXT,
    "domainHost" TEXT,
    "domainHostOther" TEXT,
    "hasDomainAccess" BOOLEAN,
    "domainAccessContact" TEXT,
    "hasEmailPlatform" BOOLEAN,
    "emailPlatform" TEXT,
    "emailPlatformOther" TEXT,
    "marketingEmail" TEXT,
    "hasEmailAdminAccess" BOOLEAN,
    "emailAdminContact" TEXT,
    "approverFirstName" TEXT,
    "approverLastName" TEXT,
    "approverEmail" TEXT,
    "approvalMethod" TEXT,
    "canSendWithoutApproval" BOOLEAN,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'SUBMITTED',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "convertedClientId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "onboarding_submissions_status_idx" ON "onboarding_submissions"("status");

-- CreateIndex
CREATE INDEX "onboarding_submissions_email_idx" ON "onboarding_submissions"("email");

-- CreateIndex
CREATE INDEX "onboarding_submissions_submittedAt_idx" ON "onboarding_submissions"("submittedAt");

-- AddForeignKey
ALTER TABLE "onboarding_submissions" ADD CONSTRAINT "onboarding_submissions_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
