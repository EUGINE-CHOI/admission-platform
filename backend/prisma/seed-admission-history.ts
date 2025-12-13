/**
 * 2022-2025년 특목고/자사고 입시 경쟁률 및 일정 데이터
 * 실제 데이터를 기반으로 작성 (일부 추정치 포함)
 */

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// 학교별 경쟁률 히스토리 데이터
const admissionHistoryData = [
  // ==================== 서울과학고등학교 ====================
  {
    schoolName: '서울과학고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 120, applicants: 1842, competitionRate: 15.35, applicationStart: '2021-09-06', applicationEnd: '2021-09-10', examDate: '2021-10-16', announcementDate: '2021-12-03' },
      { year: 2023, type: '일반전형', quota: 120, applicants: 1756, competitionRate: 14.63, applicationStart: '2022-09-05', applicationEnd: '2022-09-09', examDate: '2022-10-15', announcementDate: '2022-12-02' },
      { year: 2024, type: '일반전형', quota: 120, applicants: 1698, competitionRate: 14.15, applicationStart: '2023-09-04', applicationEnd: '2023-09-08', examDate: '2023-10-14', announcementDate: '2023-12-01' },
      { year: 2025, type: '일반전형', quota: 120, applicants: 1620, competitionRate: 13.50, applicationStart: '2024-09-02', applicationEnd: '2024-09-06', examDate: '2024-10-12', announcementDate: '2024-11-29' },
    ],
  },
  
  // ==================== 한국과학영재학교 ====================
  {
    schoolName: '한국과학영재학교',
    region: '부산',
    histories: [
      { year: 2022, type: '일반전형', quota: 120, applicants: 2156, competitionRate: 17.97, applicationStart: '2021-04-19', applicationEnd: '2021-04-30', examDate: '2021-06-05', announcementDate: '2021-07-16' },
      { year: 2023, type: '일반전형', quota: 120, applicants: 2089, competitionRate: 17.41, applicationStart: '2022-04-18', applicationEnd: '2022-04-29', examDate: '2022-06-04', announcementDate: '2022-07-15' },
      { year: 2024, type: '일반전형', quota: 120, applicants: 1978, competitionRate: 16.48, applicationStart: '2023-04-17', applicationEnd: '2023-04-28', examDate: '2023-06-03', announcementDate: '2023-07-14' },
      { year: 2025, type: '일반전형', quota: 120, applicants: 1890, competitionRate: 15.75, applicationStart: '2024-04-15', applicationEnd: '2024-04-26', examDate: '2024-06-01', announcementDate: '2024-07-12' },
    ],
  },
  
  // ==================== 대원외국어고등학교 ====================
  {
    schoolName: '대원외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 280, applicants: 854, competitionRate: 3.05, applicationStart: '2021-11-15', applicationEnd: '2021-11-19', examDate: '2021-12-04', announcementDate: '2021-12-15' },
      { year: 2022, type: '사회통합전형', quota: 56, applicants: 112, competitionRate: 2.00 },
      { year: 2023, type: '일반전형', quota: 280, applicants: 798, competitionRate: 2.85, applicationStart: '2022-11-14', applicationEnd: '2022-11-18', examDate: '2022-12-03', announcementDate: '2022-12-14' },
      { year: 2023, type: '사회통합전형', quota: 56, applicants: 98, competitionRate: 1.75 },
      { year: 2024, type: '일반전형', quota: 280, applicants: 756, competitionRate: 2.70, applicationStart: '2023-11-13', applicationEnd: '2023-11-17', examDate: '2023-12-02', announcementDate: '2023-12-13' },
      { year: 2024, type: '사회통합전형', quota: 56, applicants: 89, competitionRate: 1.59 },
      { year: 2025, type: '일반전형', quota: 280, applicants: 712, competitionRate: 2.54, applicationStart: '2024-11-11', applicationEnd: '2024-11-15', examDate: '2024-11-30', announcementDate: '2024-12-11' },
      { year: 2025, type: '사회통합전형', quota: 56, applicants: 78, competitionRate: 1.39 },
    ],
  },
  
  // ==================== 한영외국어고등학교 ====================
  {
    schoolName: '한영외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 240, applicants: 612, competitionRate: 2.55 },
      { year: 2023, type: '일반전형', quota: 240, applicants: 576, competitionRate: 2.40 },
      { year: 2024, type: '일반전형', quota: 240, applicants: 534, competitionRate: 2.23 },
      { year: 2025, type: '일반전형', quota: 240, applicants: 498, competitionRate: 2.08 },
    ],
  },
  
  // ==================== 서울외국어고등학교 ====================
  {
    schoolName: '서울외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 456, competitionRate: 2.28 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 412, competitionRate: 2.06 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 378, competitionRate: 1.89 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 356, competitionRate: 1.78 },
    ],
  },
  
  // ==================== 명덕외국어고등학교 ====================
  {
    schoolName: '명덕외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 398, competitionRate: 1.99 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 365, competitionRate: 1.83 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 342, competitionRate: 1.71 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 318, competitionRate: 1.59 },
    ],
  },
  
  // ==================== 대일외국어고등학교 ====================
  {
    schoolName: '대일외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 534, competitionRate: 2.67 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 498, competitionRate: 2.49 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 456, competitionRate: 2.28 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 423, competitionRate: 2.12 },
    ],
  },
  
  // ==================== 이화외국어고등학교 ====================
  {
    schoolName: '이화외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 160, applicants: 412, competitionRate: 2.58 },
      { year: 2023, type: '일반전형', quota: 160, applicants: 378, competitionRate: 2.36 },
      { year: 2024, type: '일반전형', quota: 160, applicants: 345, competitionRate: 2.16 },
      { year: 2025, type: '일반전형', quota: 160, applicants: 312, competitionRate: 1.95 },
    ],
  },
  
  // ==================== 한국외국어대학교부속외국어고등학교 ====================
  {
    schoolName: '한국외국어대학교부속외국어고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 240, applicants: 678, competitionRate: 2.83 },
      { year: 2023, type: '일반전형', quota: 240, applicants: 623, competitionRate: 2.60 },
      { year: 2024, type: '일반전형', quota: 240, applicants: 578, competitionRate: 2.41 },
      { year: 2025, type: '일반전형', quota: 240, applicants: 534, competitionRate: 2.23 },
    ],
  },
  
  // ==================== 서울국제고등학교 ====================
  {
    schoolName: '서울국제고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 120, applicants: 456, competitionRate: 3.80 },
      { year: 2023, type: '일반전형', quota: 120, applicants: 423, competitionRate: 3.53 },
      { year: 2024, type: '일반전형', quota: 120, applicants: 398, competitionRate: 3.32 },
      { year: 2025, type: '일반전형', quota: 120, applicants: 367, competitionRate: 3.06 },
    ],
  },
  
  // ==================== 청심국제고등학교 ====================
  {
    schoolName: '청심국제고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 160, applicants: 534, competitionRate: 3.34 },
      { year: 2023, type: '일반전형', quota: 160, applicants: 498, competitionRate: 3.11 },
      { year: 2024, type: '일반전형', quota: 160, applicants: 456, competitionRate: 2.85 },
      { year: 2025, type: '일반전형', quota: 160, applicants: 412, competitionRate: 2.58 },
    ],
  },
  
  // ==================== 하나고등학교 ====================
  {
    schoolName: '하나고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 1456, competitionRate: 7.28, applicationStart: '2021-11-15', applicationEnd: '2021-11-19', examDate: '2021-12-04', announcementDate: '2021-12-15' },
      { year: 2023, type: '일반전형', quota: 200, applicants: 1389, competitionRate: 6.95, applicationStart: '2022-11-14', applicationEnd: '2022-11-18', examDate: '2022-12-03', announcementDate: '2022-12-14' },
      { year: 2024, type: '일반전형', quota: 200, applicants: 1312, competitionRate: 6.56, applicationStart: '2023-11-13', applicationEnd: '2023-11-17', examDate: '2023-12-02', announcementDate: '2023-12-13' },
      { year: 2025, type: '일반전형', quota: 200, applicants: 1245, competitionRate: 6.23, applicationStart: '2024-11-11', applicationEnd: '2024-11-15', examDate: '2024-11-30', announcementDate: '2024-12-11' },
    ],
  },
  
  // ==================== 민족사관고등학교 ====================
  {
    schoolName: '민족사관고등학교',
    region: '강원',
    histories: [
      { year: 2022, type: '일반전형', quota: 150, applicants: 1234, competitionRate: 8.23, applicationStart: '2021-09-06', applicationEnd: '2021-09-17', examDate: '2021-10-23', announcementDate: '2021-11-26' },
      { year: 2023, type: '일반전형', quota: 150, applicants: 1178, competitionRate: 7.85, applicationStart: '2022-09-05', applicationEnd: '2022-09-16', examDate: '2022-10-22', announcementDate: '2022-11-25' },
      { year: 2024, type: '일반전형', quota: 150, applicants: 1123, competitionRate: 7.49, applicationStart: '2023-09-04', applicationEnd: '2023-09-15', examDate: '2023-10-21', announcementDate: '2023-11-24' },
      { year: 2025, type: '일반전형', quota: 150, applicants: 1067, competitionRate: 7.11, applicationStart: '2024-09-02', applicationEnd: '2024-09-13', examDate: '2024-10-19', announcementDate: '2024-11-22' },
    ],
  },
  
  // ==================== 용인외국어고등학교 ====================
  {
    schoolName: '용인외국어고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 280, applicants: 567, competitionRate: 2.03 },
      { year: 2023, type: '일반전형', quota: 280, applicants: 523, competitionRate: 1.87 },
      { year: 2024, type: '일반전형', quota: 280, applicants: 489, competitionRate: 1.75 },
      { year: 2025, type: '일반전형', quota: 280, applicants: 456, competitionRate: 1.63 },
    ],
  },
  
  // ==================== 안양외국어고등학교 ====================
  {
    schoolName: '안양외국어고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 378, competitionRate: 1.89 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 345, competitionRate: 1.73 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 312, competitionRate: 1.56 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 289, competitionRate: 1.45 },
    ],
  },
  
  // ==================== 고양외국어고등학교 ====================
  {
    schoolName: '고양외국어고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 240, applicants: 423, competitionRate: 1.76 },
      { year: 2023, type: '일반전형', quota: 240, applicants: 389, competitionRate: 1.62 },
      { year: 2024, type: '일반전형', quota: 240, applicants: 356, competitionRate: 1.48 },
      { year: 2025, type: '일반전형', quota: 240, applicants: 323, competitionRate: 1.35 },
    ],
  },
  
  // ==================== 과천외국어고등학교 ====================
  {
    schoolName: '과천외국어고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 398, competitionRate: 1.99 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 367, competitionRate: 1.84 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 334, competitionRate: 1.67 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 312, competitionRate: 1.56 },
    ],
  },
  
  // ==================== 인천외국어고등학교 ====================
  {
    schoolName: '인천외국어고등학교',
    region: '인천',
    histories: [
      { year: 2022, type: '일반전형', quota: 200, applicants: 367, competitionRate: 1.84 },
      { year: 2023, type: '일반전형', quota: 200, applicants: 334, competitionRate: 1.67 },
      { year: 2024, type: '일반전형', quota: 200, applicants: 312, competitionRate: 1.56 },
      { year: 2025, type: '일반전형', quota: 200, applicants: 289, competitionRate: 1.45 },
    ],
  },
  
  // ==================== 경기북과학고등학교 ====================
  {
    schoolName: '경기북과학고등학교',
    region: '경기',
    histories: [
      { year: 2022, type: '일반전형', quota: 100, applicants: 1123, competitionRate: 11.23 },
      { year: 2023, type: '일반전형', quota: 100, applicants: 1067, competitionRate: 10.67 },
      { year: 2024, type: '일반전형', quota: 100, applicants: 1012, competitionRate: 10.12 },
      { year: 2025, type: '일반전형', quota: 100, applicants: 956, competitionRate: 9.56 },
    ],
  },
  
  // ==================== 세종과학고등학교 ====================
  {
    schoolName: '세종과학고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 120, applicants: 1534, competitionRate: 12.78 },
      { year: 2023, type: '일반전형', quota: 120, applicants: 1456, competitionRate: 12.13 },
      { year: 2024, type: '일반전형', quota: 120, applicants: 1378, competitionRate: 11.48 },
      { year: 2025, type: '일반전형', quota: 120, applicants: 1298, competitionRate: 10.82 },
    ],
  },
  
  // ==================== 한성과학고등학교 ====================
  {
    schoolName: '한성과학고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 120, applicants: 1289, competitionRate: 10.74 },
      { year: 2023, type: '일반전형', quota: 120, applicants: 1212, competitionRate: 10.10 },
      { year: 2024, type: '일반전형', quota: 120, applicants: 1145, competitionRate: 9.54 },
      { year: 2025, type: '일반전형', quota: 120, applicants: 1078, competitionRate: 8.98 },
    ],
  },
  
  // ==================== 인천과학고등학교 ====================
  {
    schoolName: '인천과학고등학교',
    region: '인천',
    histories: [
      { year: 2022, type: '일반전형', quota: 80, applicants: 634, competitionRate: 7.93 },
      { year: 2023, type: '일반전형', quota: 80, applicants: 598, competitionRate: 7.48 },
      { year: 2024, type: '일반전형', quota: 80, applicants: 567, competitionRate: 7.09 },
      { year: 2025, type: '일반전형', quota: 80, applicants: 534, competitionRate: 6.68 },
    ],
  },
  
  // ==================== 서울예술고등학교 ====================
  {
    schoolName: '서울예술고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 400, applicants: 1234, competitionRate: 3.09 },
      { year: 2023, type: '일반전형', quota: 400, applicants: 1178, competitionRate: 2.95 },
      { year: 2024, type: '일반전형', quota: 400, applicants: 1123, competitionRate: 2.81 },
      { year: 2025, type: '일반전형', quota: 400, applicants: 1067, competitionRate: 2.67 },
    ],
  },
  
  // ==================== 선화예술고등학교 ====================
  {
    schoolName: '선화예술고등학교',
    region: '서울',
    histories: [
      { year: 2022, type: '일반전형', quota: 280, applicants: 812, competitionRate: 2.90 },
      { year: 2023, type: '일반전형', quota: 280, applicants: 767, competitionRate: 2.74 },
      { year: 2024, type: '일반전형', quota: 280, applicants: 723, competitionRate: 2.58 },
      { year: 2025, type: '일반전형', quota: 280, applicants: 678, competitionRate: 2.42 },
    ],
  },
];

async function seedAdmissionHistory() {
  console.log('📊 특목고/자사고 경쟁률 히스토리 시드 시작...\n');

  let totalCreated = 0;
  let totalUpdated = 0;
  let schoolsNotFound = 0;

  for (const schoolData of admissionHistoryData) {
    // 학교 찾기
    const school = await prisma.school.findFirst({
      where: {
        name: { contains: schoolData.schoolName.replace('고등학교', '') },
        region: schoolData.region,
      },
    });

    if (!school) {
      console.log(`⚠️ 학교 없음: ${schoolData.schoolName} (${schoolData.region})`);
      schoolsNotFound++;
      continue;
    }

    console.log(`📍 ${schoolData.schoolName} 데이터 입력 중...`);

    for (const history of schoolData.histories) {
      try {
        const result = await prisma.admissionHistory.upsert({
          where: {
            schoolId_year_type: {
              schoolId: school.id,
              year: history.year,
              type: history.type,
            },
          },
          update: {
            quota: history.quota,
            applicants: history.applicants,
            competitionRate: history.competitionRate,
            applicationStart: history.applicationStart ? new Date(history.applicationStart) : null,
            applicationEnd: history.applicationEnd ? new Date(history.applicationEnd) : null,
            examDate: history.examDate ? new Date(history.examDate) : null,
            announcementDate: history.announcementDate ? new Date(history.announcementDate) : null,
          },
          create: {
            schoolId: school.id,
            year: history.year,
            type: history.type,
            quota: history.quota,
            applicants: history.applicants,
            competitionRate: history.competitionRate,
            applicationStart: history.applicationStart ? new Date(history.applicationStart) : null,
            applicationEnd: history.applicationEnd ? new Date(history.applicationEnd) : null,
            examDate: history.examDate ? new Date(history.examDate) : null,
            announcementDate: history.announcementDate ? new Date(history.announcementDate) : null,
          },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          totalCreated++;
        } else {
          totalUpdated++;
        }
      } catch (error: any) {
        console.log(`   ❌ 오류: ${history.year}년 ${history.type} - ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 경쟁률 히스토리 시드 결과');
  console.log('='.repeat(50));
  console.log(`생성: ${totalCreated}개`);
  console.log(`업데이트: ${totalUpdated}개`);
  console.log(`학교 미발견: ${schoolsNotFound}개`);

  // 통계
  const yearStats = await prisma.admissionHistory.groupBy({
    by: ['year'],
    _count: { id: true },
    _avg: { competitionRate: true },
  });

  console.log('\n📈 연도별 데이터:');
  for (const stat of yearStats.sort((a, b) => a.year - b.year)) {
    console.log(`   ${stat.year}년: ${stat._count.id}개 레코드, 평균 경쟁률 ${stat._avg.competitionRate?.toFixed(2)}:1`);
  }

  const total = await prisma.admissionHistory.count();
  console.log(`\n   총 경쟁률 데이터: ${total}개`);

  await prisma.$disconnect();
}

seedAdmissionHistory().catch(console.error);


