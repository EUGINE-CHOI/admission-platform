import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 2025학년도 고입 주요 일정
const admissionSchedules2025 = [
  // ===== 영재학교 =====
  { name: "영재학교 원서접수", type: "APPLICATION", startDate: "2024-04-15", endDate: "2024-04-26", description: "서울과학고, 한국과학영재학교 등 전국 8개 영재학교" },
  { name: "영재학교 1단계 전형", type: "DOCUMENT_SCREENING", startDate: "2024-05-15", endDate: "2024-05-31" },
  { name: "영재학교 2단계 캠프", type: "EXAM", startDate: "2024-06-15", endDate: "2024-06-30" },
  { name: "영재학교 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-07-15", endDate: "2024-07-15" },
  
  // ===== 과학고 =====
  { name: "과학고 원서접수", type: "APPLICATION", startDate: "2024-08-01", endDate: "2024-08-10", description: "전국 20개 과학고등학교" },
  { name: "과학고 1단계 서류평가", type: "DOCUMENT_SCREENING", startDate: "2024-08-20", endDate: "2024-09-10" },
  { name: "과학고 2단계 면접", type: "INTERVIEW", startDate: "2024-09-20", endDate: "2024-10-05" },
  { name: "과학고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-10-15", endDate: "2024-10-15" },
  
  // ===== 외국어고/국제고 =====
  { name: "외고/국제고 원서접수", type: "APPLICATION", startDate: "2024-10-21", endDate: "2024-10-25", description: "전국 외국어고, 국제고" },
  { name: "외고/국제고 1단계 영어내신", type: "DOCUMENT_SCREENING", startDate: "2024-11-01", endDate: "2024-11-05" },
  { name: "외고/국제고 2단계 면접", type: "INTERVIEW", startDate: "2024-11-15", endDate: "2024-11-20" },
  { name: "외고/국제고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-11-25", endDate: "2024-11-25" },
  
  // ===== 자율형사립고 =====
  { name: "자사고 원서접수", type: "APPLICATION", startDate: "2024-11-25", endDate: "2024-11-29" },
  { name: "자사고 추첨", type: "LOTTERY", startDate: "2024-12-05", endDate: "2024-12-05" },
  { name: "자사고 면접", type: "INTERVIEW", startDate: "2024-12-10", endDate: "2024-12-15" },
  { name: "자사고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-12-18", endDate: "2024-12-18" },
  
  // ===== 예술고/체육고 =====
  { name: "예술고 원서접수", type: "APPLICATION", startDate: "2024-09-01", endDate: "2024-09-10" },
  { name: "예술고 실기시험", type: "EXAM", startDate: "2024-09-20", endDate: "2024-10-05" },
  { name: "예술고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-10-15", endDate: "2024-10-15" },
  { name: "체육고 원서접수", type: "APPLICATION", startDate: "2024-09-01", endDate: "2024-09-10" },
  { name: "체육고 실기시험", type: "EXAM", startDate: "2024-09-25", endDate: "2024-10-10" },
  { name: "체육고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-10-20", endDate: "2024-10-20" },
  
  // ===== 특성화고/마이스터고 =====
  { name: "마이스터고 원서접수", type: "APPLICATION", startDate: "2024-09-15", endDate: "2024-09-25", description: "전국 마이스터고등학교" },
  { name: "마이스터고 면접", type: "INTERVIEW", startDate: "2024-10-10", endDate: "2024-10-20" },
  { name: "마이스터고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-10-25", endDate: "2024-10-25" },
  { name: "특성화고 원서접수", type: "APPLICATION", startDate: "2024-11-01", endDate: "2024-11-10" },
  { name: "특성화고 면접/실기", type: "INTERVIEW", startDate: "2024-11-20", endDate: "2024-11-30" },
  { name: "특성화고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2024-12-05", endDate: "2024-12-05" },
  
  // ===== 일반고 =====
  { name: "일반고 원서접수", type: "APPLICATION", startDate: "2024-12-09", endDate: "2024-12-13" },
  { name: "일반고 추첨 배정", type: "LOTTERY", startDate: "2024-12-20", endDate: "2024-12-20" },
  { name: "일반고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2025-01-10", endDate: "2025-01-10" },
];

// 2026학년도 고입 예상 일정
const admissionSchedules2026 = [
  { name: "2026 영재학교 원서접수", type: "APPLICATION", startDate: "2025-04-14", endDate: "2025-04-25", description: "2026학년도 영재학교 입학 전형" },
  { name: "2026 영재학교 1단계", type: "DOCUMENT_SCREENING", startDate: "2025-05-15", endDate: "2025-05-31" },
  { name: "2026 영재학교 캠프", type: "EXAM", startDate: "2025-06-15", endDate: "2025-06-30" },
  { name: "2026 영재학교 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2025-07-15", endDate: "2025-07-15" },
  
  { name: "2026 과학고 원서접수", type: "APPLICATION", startDate: "2025-08-01", endDate: "2025-08-10" },
  { name: "2026 과학고 서류평가", type: "DOCUMENT_SCREENING", startDate: "2025-08-20", endDate: "2025-09-10" },
  { name: "2026 과학고 면접", type: "INTERVIEW", startDate: "2025-09-20", endDate: "2025-10-05" },
  { name: "2026 과학고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2025-10-15", endDate: "2025-10-15" },
  
  { name: "2026 외고/국제고 원서접수", type: "APPLICATION", startDate: "2025-10-20", endDate: "2025-10-24" },
  { name: "2026 외고/국제고 면접", type: "INTERVIEW", startDate: "2025-11-15", endDate: "2025-11-20" },
  { name: "2026 외고/국제고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2025-11-25", endDate: "2025-11-25" },
  
  { name: "2026 자사고 원서접수", type: "APPLICATION", startDate: "2025-11-24", endDate: "2025-11-28" },
  { name: "2026 자사고 면접", type: "INTERVIEW", startDate: "2025-12-10", endDate: "2025-12-15" },
  { name: "2026 자사고 최종 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2025-12-18", endDate: "2025-12-18" },
  
  { name: "2026 일반고 원서접수", type: "APPLICATION", startDate: "2025-12-08", endDate: "2025-12-12" },
  { name: "2026 일반고 배정 발표", type: "RESULT_ANNOUNCEMENT", startDate: "2026-01-10", endDate: "2026-01-10" },
];

// 입학 설명회
const infoSessions = [
  { name: "서울과학고 입학설명회", type: "INFO_SESSION", startDate: "2024-03-20", endDate: "2024-03-20" },
  { name: "외고/국제고 연합 설명회", type: "INFO_SESSION", startDate: "2024-09-15", endDate: "2024-09-15" },
  { name: "자사고 연합 입학설명회", type: "INFO_SESSION", startDate: "2024-10-20", endDate: "2024-10-20" },
  { name: "2026 영재학교 설명회", type: "INFO_SESSION", startDate: "2025-03-15", endDate: "2025-03-15" },
];

async function seedSchedules() {
  console.log('📅 입시 일정 데이터 추가 시작...');

  const allSchedules = [
    ...admissionSchedules2025,
    ...admissionSchedules2026,
    ...infoSessions,
  ];

  let created = 0;
  let skipped = 0;

  for (const schedule of allSchedules) {
    const existing = await prisma.admissionSchedule.findFirst({
      where: {
        title: schedule.name,
        startDate: new Date(schedule.startDate),
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.admissionSchedule.create({
      data: {
        title: schedule.name,
        type: schedule.type as any,
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        description: schedule.description || null,
        publishStatus: 'PUBLISHED',
      },
    });
    created++;
  }

  console.log(`✅ 입시 일정 데이터 추가 완료: ${created}개 생성, ${skipped}개 스킵`);
}

seedSchedules()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
