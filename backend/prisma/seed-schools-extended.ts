import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 서울 주요 일반고
const seoulGeneralHighSchools = [
  { name: "경기고등학교", region: "서울", website: "http://kyunggi.hs.kr" },
  { name: "서울고등학교", region: "서울", website: "http://seoul.hs.kr" },
  { name: "휘문고등학교", region: "서울", website: "http://whimoon.hs.kr" },
  { name: "중동고등학교", region: "서울", website: "http://choongdong.hs.kr" },
  { name: "중앙고등학교", region: "서울", website: "http://chungang.hs.kr" },
  { name: "배재고등학교", region: "서울", website: "http://paejae.hs.kr" },
  { name: "보성고등학교", region: "서울", website: "http://bosung.hs.kr" },
  { name: "양정고등학교", region: "서울", website: "http://yangjung.hs.kr" },
  { name: "숭문고등학교", region: "서울", website: "http://sungmoon.hs.kr" },
  { name: "대광고등학교", region: "서울", website: "http://daekwang.hs.kr" },
  { name: "한양고등학교", region: "서울", website: "http://hanyang.hs.kr" },
  { name: "창덕여자고등학교", region: "서울", website: "http://changduk.hs.kr" },
  { name: "정신여자고등학교", region: "서울", website: "http://jungsin.hs.kr" },
  { name: "숙명여자고등학교", region: "서울", website: "http://sookmyung.hs.kr" },
  { name: "경기여자고등학교", region: "서울", website: "http://kyunggi-g.hs.kr" },
  { name: "이화여자고등학교", region: "서울", website: "http://ewha.hs.kr" },
  { name: "동덕여자고등학교", region: "서울", website: "http://dongduk.hs.kr" },
  { name: "서울여자고등학교", region: "서울", website: "http://seoulwomen.hs.kr" },
];

// 경기 주요 일반고
const gyeonggiGeneralHighSchools = [
  { name: "분당중앙고등학교", region: "경기", website: "http://bundangjungang.hs.kr" },
  { name: "낙생고등학교", region: "경기", website: "http://nakseong.hs.kr" },
  { name: "서현고등학교", region: "경기", website: "http://seohyun.hs.kr" },
  { name: "분당고등학교", region: "경기", website: "http://bundang.hs.kr" },
  { name: "백현고등학교", region: "경기", website: "http://baekhyun.hs.kr" },
  { name: "판교고등학교", region: "경기", website: "http://pangyo.hs.kr" },
  { name: "수원고등학교", region: "경기", website: "http://suwon.hs.kr" },
  { name: "영생고등학교", region: "경기", website: "http://youngseong.hs.kr" },
  { name: "화성고등학교", region: "경기", website: "http://hwaseong.hs.kr" },
];

// IT/소프트웨어 특성화고
const specializedHighSchools = [
  { name: "선린인터넷고등학교", region: "서울", website: "http://sunrint.hs.kr" },
  { name: "미림여자정보과학고등학교", region: "서울", website: "http://e-mirim.hs.kr" },
  { name: "한국디지털미디어고등학교", region: "경기", website: "http://dimigo.hs.kr" },
  { name: "서울디자인고등학교", region: "서울", website: "http://seouldesign.hs.kr" },
  { name: "한국애니메이션고등학교", region: "경기", website: "http://anigo.hs.kr" },
  { name: "서울관광고등학교", region: "서울", website: "http://seoulth.hs.kr" },
  { name: "서울금융고등학교", region: "서울", website: "http://sfh.hs.kr" },
  { name: "서울호텔관광고등학교", region: "서울", website: "http://seoulhotel.hs.kr" },
];

async function seedExtendedSchools() {
  console.log('🏫 학교 데이터 확장 시작...');

  const allSchools = [
    ...seoulGeneralHighSchools.map(s => ({ ...s, type: 'GENERAL' as const })),
    ...gyeonggiGeneralHighSchools.map(s => ({ ...s, type: 'GENERAL' as const })),
    ...specializedHighSchools.map(s => ({ ...s, type: 'SPECIALIZED' as const })),
  ];

  let created = 0;
  let skipped = 0;

  for (const school of allSchools) {
    const existing = await prisma.school.findFirst({
      where: { name: school.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.school.create({
      data: {
        name: school.name,
        type: school.type,
        region: school.region,
        website: school.website,
        publishStatus: 'PUBLISHED',
      },
    });
    created++;
  }

  console.log(`✅ 학교 데이터 확장 완료: ${created}개 생성, ${skipped}개 스킵`);
}

seedExtendedSchools()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
