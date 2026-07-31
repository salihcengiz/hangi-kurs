-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('DERSHANE', 'KURS_MERKEZI', 'ETUT', 'ONLINE');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('YKS', 'LGS', 'KPSS', 'DIL', 'DIGER');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('OFFICIAL', 'USER_REPORTED', 'ESTIMATED');

-- CreateEnum
CREATE TYPE "PerformanceSource" AS ENUM ('INSTITUTION_CLAIM', 'OSYM_PUBLIC', 'USER_REPORTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "type" "InstitutionType" NOT NULL,
    "description" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "website" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "capacity" INTEGER,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "targetGrade" TEXT,
    "weeklyHours" INTEGER NOT NULL,
    "classSize" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "includesMaterials" BOOLEAN NOT NULL DEFAULT false,
    "includesEtut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_records" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "listPrice" INTEGER NOT NULL,
    "discountedPrice" INTEGER,
    "installmentCount" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "source" "PriceSource" NOT NULL,
    "sourceNote" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_records" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "studentCount" INTEGER,
    "avgNetIncrease" DOUBLE PRECISION,
    "top1000Count" INTEGER,
    "placementRate" DOUBLE PRECISION,
    "source" "PerformanceSource" NOT NULL,
    "sourceNote" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "performance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "authorAlias" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "teachingScore" INTEGER,
    "facilityScore" INTEGER,
    "guidanceScore" INTEGER,
    "valueScore" INTEGER,
    "body" TEXT NOT NULL,
    "attendedYear" INTEGER,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_slug_key" ON "institutions"("slug");

-- CreateIndex
CREATE INDEX "institutions_type_idx" ON "institutions"("type");

-- CreateIndex
CREATE INDEX "branches_institutionId_idx" ON "branches"("institutionId");

-- CreateIndex
CREATE INDEX "branches_city_district_idx" ON "branches"("city", "district");

-- CreateIndex
CREATE INDEX "programs_institutionId_idx" ON "programs"("institutionId");

-- CreateIndex
CREATE INDEX "programs_examType_idx" ON "programs"("examType");

-- CreateIndex
CREATE INDEX "price_records_programId_idx" ON "price_records"("programId");

-- CreateIndex
CREATE INDEX "price_records_programId_academicYear_idx" ON "price_records"("programId", "academicYear");

-- CreateIndex
CREATE INDEX "performance_records_institutionId_idx" ON "performance_records"("institutionId");

-- CreateIndex
CREATE INDEX "performance_records_institutionId_academicYear_idx" ON "performance_records"("institutionId", "academicYear");

-- CreateIndex
CREATE INDEX "reviews_institutionId_status_idx" ON "reviews"("institutionId", "status");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_records" ADD CONSTRAINT "performance_records_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
