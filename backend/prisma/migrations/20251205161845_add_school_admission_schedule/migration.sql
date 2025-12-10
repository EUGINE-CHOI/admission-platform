-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('GENERAL', 'SPECIAL', 'AUTONOMOUS', 'SPECIALIZED');

-- CreateEnum
CREATE TYPE "AdmissionType" AS ENUM ('GENERAL', 'SPECIAL', 'TALENT', 'SOCIAL');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('INFO_SESSION', 'APPLICATION', 'DOCUMENT', 'INTERVIEW', 'ANNOUNCEMENT', 'REGISTRATION');

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SchoolType" NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "features" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "AdmissionType" NOT NULL,
    "name" TEXT NOT NULL,
    "quota" INTEGER,
    "requirements" TEXT,
    "gradeWeight" DOUBLE PRECISION,
    "interviewWeight" DOUBLE PRECISION,
    "essayWeight" DOUBLE PRECISION,
    "cutoffGrade" DOUBLE PRECISION,
    "competitionRate" DOUBLE PRECISION,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_schedules" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "ScheduleType" NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "note" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_schools" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_region_key" ON "schools"("name", "region");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_schoolId_year_type_name_key" ON "admissions"("schoolId", "year", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_schools_studentId_schoolId_key" ON "favorite_schools"("studentId", "schoolId");

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_schedules" ADD CONSTRAINT "admission_schedules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_schools" ADD CONSTRAINT "favorite_schools_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
