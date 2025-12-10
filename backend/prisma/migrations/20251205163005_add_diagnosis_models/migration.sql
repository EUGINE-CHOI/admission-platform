-- CreateEnum
CREATE TYPE "DiagnosisLevel" AS ENUM ('FIT', 'CHALLENGE', 'UNLIKELY');

-- CreateTable
CREATE TABLE "target_schools" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "target_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT,
    "level" "DiagnosisLevel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "gradeScore" DOUBLE PRECISION,
    "activityScore" DOUBLE PRECISION,
    "attendanceScore" DOUBLE PRECISION,
    "volunteerScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommended_schools" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "level" "DiagnosisLevel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "diagnosedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommended_schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "target_schools_studentId_schoolId_key" ON "target_schools"("studentId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "recommended_schools_studentId_schoolId_diagnosedAt_key" ON "recommended_schools"("studentId", "schoolId", "diagnosedAt");

-- AddForeignKey
ALTER TABLE "target_schools" ADD CONSTRAINT "target_schools_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_schools" ADD CONSTRAINT "target_schools_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_results" ADD CONSTRAINT "diagnosis_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_results" ADD CONSTRAINT "diagnosis_results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_schools" ADD CONSTRAINT "recommended_schools_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_schools" ADD CONSTRAINT "recommended_schools_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
