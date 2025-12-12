import { PrismaClient, ScheduleType, PublishStatus } from '../generated/prisma';

const prisma = new PrismaClient();

// 2025학년도 고입 일정 (예상 일정 - 실제 일정은 각 학교/교육청 공지 확인 필요)
interface ScheduleData {
  schoolName: string;
  region: string;
  schedules: {
    type: ScheduleType;
    title: string;
    startDate: Date;
    endDate?: Date;
    note: string;
  }[];
}

const admissionSchedules2025: ScheduleData[] = [
  // === 과학영재학교 (2024년 4~6월 전형) ===
  {
    schoolName: '서울과학고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-03-20'), note: '온라인 입학설명회 및 학교 홍보' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-04-15'), endDate: new Date('2024-04-19'), note: '인터넷 원서접수 및 서류제출' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류심사', startDate: new Date('2024-04-22'), endDate: new Date('2024-05-03'), note: '자기소개서 및 학교생활기록부 평가' },
      { type: ScheduleType.EXAM, title: '2단계 창의적문제해결력평가', startDate: new Date('2024-05-18'), note: '수학, 과학 문제해결력 평가' },
      { type: ScheduleType.INTERVIEW, title: '3단계 심층면접', startDate: new Date('2024-06-08'), endDate: new Date('2024-06-09'), note: '학업 열정 및 인성 면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '최종합격자 발표', startDate: new Date('2024-06-21'), note: '최종 합격자 발표 및 등록안내' },
    ],
  },
  {
    schoolName: '경기과학고등학교',
    region: '경기',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-03-22'), note: '온라인 입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-04-15'), endDate: new Date('2024-04-19'), note: '인터넷 원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류심사', startDate: new Date('2024-04-22'), endDate: new Date('2024-05-03'), note: '서류평가' },
      { type: ScheduleType.EXAM, title: '2단계 영재성검사', startDate: new Date('2024-05-18'), note: '수학·과학 창의력 검사' },
      { type: ScheduleType.INTERVIEW, title: '3단계 캠프전형', startDate: new Date('2024-06-07'), endDate: new Date('2024-06-09'), note: '과학캠프 및 면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '최종합격자 발표', startDate: new Date('2024-06-21'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '한국과학영재학교',
    region: '부산',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-03-15'), note: '전국 순회 설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-04-08'), endDate: new Date('2024-04-12'), note: '인터넷 원서접수 (전국모집)' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류심사', startDate: new Date('2024-04-15'), endDate: new Date('2024-04-26'), note: '학업성취도 및 영재성 평가' },
      { type: ScheduleType.EXAM, title: '2단계 창의적문제해결력평가', startDate: new Date('2024-05-11'), note: '수학, 과학, 정보 창의력 검사' },
      { type: ScheduleType.INTERVIEW, title: '3단계 캠프전형', startDate: new Date('2024-05-31'), endDate: new Date('2024-06-02'), note: '과학캠프 및 심층면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '최종합격자 발표', startDate: new Date('2024-06-14'), note: '합격자 발표 및 등록' },
    ],
  },
  
  // === 외국어고 (2024년 10~12월 전형) ===
  {
    schoolName: '대원외국어고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-21'), note: '학교 방문 입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '인터넷 원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류평가', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '내신성적 및 출결 평가' },
      { type: ScheduleType.INTERVIEW, title: '2단계 면접', startDate: new Date('2024-11-16'), endDate: new Date('2024-11-17'), note: '영어 구술면접 및 인성면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-22'), note: '합격자 발표' },
      { type: ScheduleType.REGISTRATION, title: '등록', startDate: new Date('2024-11-25'), endDate: new Date('2024-11-27'), note: '합격자 등록' },
    ],
  },
  {
    schoolName: '한영외국어고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-28'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '인터넷 원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류평가', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '내신 및 출결 평가' },
      { type: ScheduleType.INTERVIEW, title: '2단계 면접', startDate: new Date('2024-11-16'), endDate: new Date('2024-11-17'), note: '면접 (영어, 인성)' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-22'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '인천외국어고등학교',
    region: '인천',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-14'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류심사', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '내신성적 평가' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-11-09'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-15'), note: '합격자 발표' },
    ],
  },
  
  // === 자율형 사립고 (전국단위) ===
  {
    schoolName: '민족사관고등학교',
    region: '강원',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-08-24'), note: '전국 순회 설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-09-02'), endDate: new Date('2024-09-06'), note: '인터넷 원서접수 (전국모집)' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류평가', startDate: new Date('2024-09-09'), endDate: new Date('2024-09-20'), note: '자기소개서 및 추천서 평가' },
      { type: ScheduleType.EXAM, title: '2단계 학업능력평가', startDate: new Date('2024-10-05'), note: '수학, 영어 학업능력 평가' },
      { type: ScheduleType.INTERVIEW, title: '3단계 면접', startDate: new Date('2024-10-26'), endDate: new Date('2024-10-27'), note: '심층면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '최종합격자 발표', startDate: new Date('2024-11-08'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '하나고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-08-31'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-09-09'), endDate: new Date('2024-09-13'), note: '원서접수 (전국모집)' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '1단계 서류전형', startDate: new Date('2024-09-16'), endDate: new Date('2024-09-27'), note: '서류심사' },
      { type: ScheduleType.INTERVIEW, title: '2단계 면접', startDate: new Date('2024-10-19'), endDate: new Date('2024-10-20'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-01'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '상산고등학교',
    region: '전북',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-07'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-09-23'), endDate: new Date('2024-09-27'), note: '원서접수 (전국모집)' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류평가', startDate: new Date('2024-09-30'), endDate: new Date('2024-10-11'), note: '서류심사' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-10-26'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-08'), note: '합격자 발표' },
    ],
  },
  
  // === 국제고 ===
  {
    schoolName: '서울국제고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-14'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류평가', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '내신 및 서류 평가' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-11-16'), note: '영어면접 및 인성면접' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-22'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '청심국제고등학교',
    region: '경기',
    schedules: [
      { type: ScheduleType.INFO_SESSION, title: '2025학년도 입학설명회', startDate: new Date('2024-09-21'), note: '입학설명회' },
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-07'), endDate: new Date('2024-10-11'), note: '원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류평가', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-25'), note: '서류심사' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-11-09'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-15'), note: '합격자 발표' },
    ],
  },
  
  // === 기타 외국어고 ===
  {
    schoolName: '명덕외국어고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '인터넷 원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류평가', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '서류심사' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-11-16'), endDate: new Date('2024-11-17'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-22'), note: '합격자 발표' },
    ],
  },
  {
    schoolName: '이화외국어고등학교',
    region: '서울',
    schedules: [
      { type: ScheduleType.APPLICATION, title: '원서접수', startDate: new Date('2024-10-14'), endDate: new Date('2024-10-18'), note: '원서접수' },
      { type: ScheduleType.DOCUMENT_SCREENING, title: '서류평가', startDate: new Date('2024-10-21'), endDate: new Date('2024-11-01'), note: '서류심사' },
      { type: ScheduleType.INTERVIEW, title: '면접', startDate: new Date('2024-11-16'), endDate: new Date('2024-11-17'), note: '면접전형' },
      { type: ScheduleType.RESULT_ANNOUNCEMENT, title: '합격자 발표', startDate: new Date('2024-11-22'), note: '합격자 발표' },
    ],
  },
];

async function main() {
  console.log('📅 2025학년도 입시 일정 시드 데이터 삽입 시작...');
  
  let schedulesCreated = 0;
  let schedulesSkipped = 0;
  let schoolsNotFound = 0;
  
  for (const data of admissionSchedules2025) {
    // 학교 찾기
    const school = await prisma.school.findFirst({
      where: { name: data.schoolName, region: data.region },
    });
    
    if (!school) {
      console.log(`⚠️ 학교를 찾을 수 없음: ${data.schoolName} (${data.region})`);
      schoolsNotFound++;
      continue;
    }
    
    // 일정 추가
    for (const schedule of data.schedules) {
      try {
        // 중복 체크
        const existing = await prisma.admissionSchedule.findFirst({
          where: {
            schoolId: school.id,
            type: schedule.type,
            startDate: schedule.startDate,
          },
        });
        
        if (existing) {
          schedulesSkipped++;
          continue;
        }
        
        await prisma.admissionSchedule.create({
          data: {
            schoolId: school.id,
            year: 2025,
            type: schedule.type,
            title: schedule.title,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            note: schedule.note,
            publishStatus: PublishStatus.PUBLISHED,
          },
        });
        schedulesCreated++;
      } catch (error: any) {
        console.error(`❌ 일정 추가 실패 (${data.schoolName} - ${schedule.title}):`, error.message);
      }
    }
  }
  
  console.log(`✅ 입시 일정 시드 완료:`);
  console.log(`   - 생성된 일정: ${schedulesCreated}개`);
  console.log(`   - 건너뛴 일정(중복): ${schedulesSkipped}개`);
  console.log(`   - 학교 미발견: ${schoolsNotFound}개`);
  
  // 전체 일정 통계
  const stats = await prisma.admissionSchedule.groupBy({
    by: ['type'],
    _count: { id: true },
  });
  
  console.log('\n📊 전체 입시 일정 통계:');
  let total = 0;
  for (const stat of stats) {
    console.log(`   - ${stat.type}: ${stat._count.id}개`);
    total += stat._count.id;
  }
  console.log(`   총합: ${total}개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
