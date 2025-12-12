import { PrismaClient, SchoolType, PublishStatus } from '../generated/prisma';

const prisma = new PrismaClient();

// 전국 특목고 데이터
const specializedHighSchools = [
  // === 과학고 ===
  // 서울
  { name: '서울과학고등학교', type: SchoolType.SCIENCE, region: '서울', address: '서울시 종로구 혜화로 63', website: 'https://sshs.sen.hs.kr', features: ['영재학교', '과학영재교육'] },
  { name: '한성과학고등학교', type: SchoolType.SCIENCE, region: '서울', address: '서울시 서대문구 이화여대길 52', website: 'https://hansung.sen.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 경기
  { name: '경기과학고등학교', type: SchoolType.SCIENCE, region: '경기', address: '경기도 수원시 장안구 수일로 135', website: 'https://kgs.hs.kr', features: ['영재학교', '과학영재교육'] },
  
  // 인천
  { name: '인천과학고등학교', type: SchoolType.SCIENCE, region: '인천', address: '인천시 연수구 아카데미로 107', website: 'https://icshs.icems.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 부산
  { name: '부산과학고등학교', type: SchoolType.SCIENCE, region: '부산', address: '부산시 금정구 체육공원로 399번길 7', website: 'https://bsshs.pen.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  { name: '한국과학영재학교', type: SchoolType.SCIENCE, region: '부산', address: '부산시 부산진구 백양대로 672', website: 'https://ksa.hs.kr', features: ['영재학교', '과학영재교육', '전국모집'] },
  
  // 대구
  { name: '대구과학고등학교', type: SchoolType.SCIENCE, region: '대구', address: '대구시 동구 동부로 83', website: 'https://daegusch.dge.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 대전
  { name: '대전과학고등학교', type: SchoolType.SCIENCE, region: '대전', address: '대전시 유성구 가정로 120', website: 'https://djsh.djsch.kr', features: ['영재학교', '과학영재교육'] },
  
  // 광주
  { name: '광주과학고등학교', type: SchoolType.SCIENCE, region: '광주', address: '광주시 북구 첨단과기로 123', website: 'https://gshs.gen.hs.kr', features: ['영재학교', '과학영재교육'] },
  
  // 울산
  { name: '울산과학고등학교', type: SchoolType.SCIENCE, region: '울산', address: '울산시 울주군 언양읍 헌양4길 18', website: 'https://usshs.use.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 세종
  { name: '세종과학예술영재학교', type: SchoolType.SCIENCE, region: '세종', address: '세종시 조치원읍 세종로 2151', website: 'https://ssag.sje.hs.kr', features: ['영재학교', '과학·예술융합'] },
  
  // 충북
  { name: '충북과학고등학교', type: SchoolType.SCIENCE, region: '충북', address: '충북 청주시 흥덕구 복대로 115', website: 'https://cbsh.cbe.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 충남
  { name: '충남과학고등학교', type: SchoolType.SCIENCE, region: '충남', address: '충남 공주시 반포면 계룡산로 567', website: 'https://cnsh.cne.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 전북
  { name: '전북과학고등학교', type: SchoolType.SCIENCE, region: '전북', address: '전북 익산시 부송로 107', website: 'https://jbsh.jbe.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 전남
  { name: '전남과학고등학교', type: SchoolType.SCIENCE, region: '전남', address: '전남 나주시 빛가람동 도래로 61', website: 'https://jnsh.jne.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 경북
  { name: '경북과학고등학교', type: SchoolType.SCIENCE, region: '경북', address: '경북 포항시 북구 흥해읍 과학로 64', website: 'https://kbsh.kbe.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 경남
  { name: '경남과학고등학교', type: SchoolType.SCIENCE, region: '경남', address: '경남 진주시 가좌동 380', website: 'https://knsh.kne.hs.kr', features: ['영재학교', '과학영재교육'] },
  
  // 강원
  { name: '강원과학고등학교', type: SchoolType.SCIENCE, region: '강원', address: '강원 원주시 중앙로 33', website: 'https://kwsh.kwe.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // 제주
  { name: '제주과학고등학교', type: SchoolType.SCIENCE, region: '제주', address: '제주시 아라이동 산6-1', website: 'https://jjsh.jje.hs.kr', features: ['과학영재', '수학·과학특성화'] },
  
  // === 외국어고 ===
  // 서울
  { name: '대원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', address: '서울시 광진구 용마산로22길 26', website: 'https://daewon.sen.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  { name: '한영외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', address: '서울시 강동구 올림픽로 651', website: 'https://hanyoung.sen.hs.kr', features: ['외국어특성화', '영어·중국어·독일어'] },
  { name: '명덕외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', address: '서울시 강남구 역삼동 707', website: 'https://myungduk.sen.hs.kr', features: ['외국어특성화', '영어·일본어·중국어'] },
  { name: '이화외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', address: '서울시 강북구 솔매로 40', website: 'https://ehwa.sen.hs.kr', features: ['외국어특성화', '영어·프랑스어·독일어'] },
  { name: '서울외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', address: '서울시 서초구 효령로 197', website: 'https://seoulfl.sen.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  
  // 경기
  { name: '과천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 과천시 관문로 89', website: 'https://gcfl.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  { name: '고양외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 고양시 일산서구 주엽로 60', website: 'https://gyfl.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  { name: '성남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 성남시 수정구 희망로 496', website: 'https://snfl.hs.kr', features: ['외국어특성화', '영어·일본어'] },
  { name: '수원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 수원시 팔달구 효원로 323', website: 'https://swfl.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  { name: '안양외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 안양시 동안구 귀인로 116', website: 'https://ayfl.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  { name: '김포외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 김포시 김포한강4로 48', website: 'https://gpfl.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  { name: '동두천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', address: '경기도 동두천시 쇠목길 94', website: 'https://ddc.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  
  // 인천
  { name: '인천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '인천', address: '인천시 중구 인중로 47', website: 'https://icfl.icems.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  
  // 부산
  { name: '부산외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '부산', address: '부산시 남구 수영로 196', website: 'https://bufl.pen.hs.kr', features: ['외국어특성화', '영어·중국어·일본어·러시아어'] },
  
  // 대구
  { name: '대구외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '대구', address: '대구시 달서구 두류3동 산200', website: 'https://dgfl.dge.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  
  // 대전
  { name: '대전외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '대전', address: '대전시 서구 계백로 1156', website: 'https://djfl.dje.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  
  // 광주
  { name: '전남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '광주', address: '전남 나주시 산포면 신안로 23', website: 'https://jnfl.jne.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  
  // 충북
  { name: '충북외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '충북', address: '충북 청주시 서원구 청남로 2096', website: 'https://cbfl.cbe.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  
  // 충남
  { name: '충남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '충남', address: '충남 천안시 동남구 충절로 521', website: 'https://cnfl.cne.hs.kr', features: ['외국어특성화', '영어·일본어·중국어'] },
  
  // 경북
  { name: '경북외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경북', address: '경북 구미시 금오산로 388', website: 'https://kbfl.kbe.hs.kr', features: ['외국어특성화', '영어·중국어·일본어'] },
  
  // 경남
  { name: '김해외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경남', address: '경남 김해시 진영읍 진영로 516', website: 'https://ghfl.kne.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  
  // 강원
  { name: '강원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '강원', address: '강원 원주시 단계동 산120-1', website: 'https://kwfl.kwe.hs.kr', features: ['외국어특성화', '영어·중국어'] },
  
  // === 국제고 ===
  { name: '서울국제고등학교', type: SchoolType.INTERNATIONAL, region: '서울', address: '서울시 종로구 성균관로 16', website: 'https://seoulis.sen.hs.kr', features: ['국제화교육', 'IB과정', '영어몰입교육'] },
  { name: '청심국제고등학교', type: SchoolType.INTERNATIONAL, region: '경기', address: '경기도 가평군 설악면 미사리로 324', website: 'https://csia.hs.kr', features: ['국제화교육', 'IB과정'] },
  { name: '부산국제고등학교', type: SchoolType.INTERNATIONAL, region: '부산', address: '부산시 해운대구 APEC로 42', website: 'https://bihs.pen.hs.kr', features: ['국제화교육', 'IB과정'] },
  { name: '대원국제중학교', type: SchoolType.INTERNATIONAL, region: '서울', address: '서울시 광진구 용마산로22길 26', website: 'https://daewonis.sen.ms.kr', features: ['국제화교육', '국제중학교'] },
  { name: '영훈국제중학교', type: SchoolType.INTERNATIONAL, region: '서울', address: '서울시 강북구 수유로42길 22', website: 'https://younghoon.sen.ms.kr', features: ['국제화교육', '국제중학교'] },
  
  // === 예술고 ===
  { name: '서울예술고등학교', type: SchoolType.ARTS, region: '서울', address: '서울시 종로구 창경궁로26길 28-15', website: 'https://seoularts.sen.hs.kr', features: ['예술특성화', '음악·미술·무용'] },
  { name: '선화예술고등학교', type: SchoolType.ARTS, region: '서울', address: '서울시 성동구 왕십리로4길 17', website: 'https://sunhwa.sen.hs.kr', features: ['예술특성화', '음악·미술·무용'] },
  { name: '덕원예술고등학교', type: SchoolType.ARTS, region: '서울', address: '서울시 서초구 효령로 34', website: 'https://dukwon.sen.hs.kr', features: ['예술특성화', '음악·미술·연극영화'] },
  { name: '계원예술고등학교', type: SchoolType.ARTS, region: '경기', address: '경기도 의왕시 계원대학로 5', website: 'https://kaywon.hs.kr', features: ['예술특성화', '미술·디자인'] },
  { name: '안양예술고등학교', type: SchoolType.ARTS, region: '경기', address: '경기도 안양시 만안구 예술공원로 185', website: 'https://ayarts.hs.kr', features: ['예술특성화', '음악·미술'] },
  { name: '부산예술고등학교', type: SchoolType.ARTS, region: '부산', address: '부산시 연제구 연제로 93', website: 'https://buarts.pen.hs.kr', features: ['예술특성화', '음악·미술·무용'] },
  { name: '전주예술고등학교', type: SchoolType.ARTS, region: '전북', address: '전북 전주시 완산구 기린대로 200', website: 'https://jjarts.jbe.hs.kr', features: ['예술특성화', '음악·미술·무용'] },
  
  // === 체육고 ===
  { name: '서울체육고등학교', type: SchoolType.SPORTS, region: '서울', address: '서울시 송파구 올림픽로 424', website: 'https://seoulpe.sen.hs.kr', features: ['체육특성화', '엘리트체육'] },
  { name: '경기체육고등학교', type: SchoolType.SPORTS, region: '경기', address: '경기도 수원시 장안구 송정로 85', website: 'https://ggpe.hs.kr', features: ['체육특성화', '엘리트체육'] },
  { name: '부산체육고등학교', type: SchoolType.SPORTS, region: '부산', address: '부산시 강서구 체육공원로 1', website: 'https://bupe.pen.hs.kr', features: ['체육특성화', '엘리트체육'] },
  { name: '대구체육고등학교', type: SchoolType.SPORTS, region: '대구', address: '대구시 수성구 유니버시아드로 200', website: 'https://dgpe.dge.hs.kr', features: ['체육특성화', '엘리트체육'] },
];

// 전국 자율형 사립고 데이터
const autonomousHighSchools = [
  // 서울
  { name: '하나고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 은평구 연서로 535', website: 'https://hana.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '현대청운고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '울산', address: '울산시 동구 방어진순환도로 1060', website: 'https://hcu.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '상산고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '전북', address: '전북 전주시 완산구 성덕로 96', website: 'https://sangsan.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '외대부속고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 동대문구 이문로 107', website: 'https://hafs.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '민족사관고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '강원', address: '강원 횡성군 안흥면 봉화로 800', website: 'https://minjok.hs.kr', features: ['자사고', '전국단위모집', '민족교육'] },
  { name: '용인한국외국어대학교부설고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경기', address: '경기도 용인시 모현읍 외대로 54', website: 'https://yflhs.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '김천고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경북', address: '경북 김천시 남산길 84', website: 'https://gimcheon.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '광양제철고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '전남', address: '전남 광양시 제철로 46', website: 'https://poscogyhs.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '포항제철고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경북', address: '경북 포항시 남구 지곡로 79', website: 'https://poscohs.hs.kr', features: ['자사고', '전국단위모집'] },
  { name: '북일고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '충남', address: '충남 천안시 동남구 북일고길 15', website: 'https://pugil.hs.kr', features: ['자사고', '전국단위모집'] },
  
  // 서울 광역단위 자사고
  { name: '세화고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 서초구 효령로 34', website: 'https://sehwa.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '경희고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 동대문구 경희대로 26', website: 'https://kyunghee.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '이화여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 중구 정동길 3', website: 'https://ewha.sen.hs.kr', features: ['자사고', '서울광역', '여학교'] },
  { name: '숙명여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 용산구 청파로47길 100', website: 'https://sookmyung.sen.hs.kr', features: ['자사고', '서울광역', '여학교'] },
  { name: '중앙고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 종로구 창경궁로 164', website: 'https://choongang.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '휘문고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 강남구 대치동 952', website: 'https://whimoon.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '세화여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 서초구 반포대로 58', website: 'https://sehwagirls.sen.hs.kr', features: ['자사고', '서울광역', '여학교'] },
  { name: '배재고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 강동구 올림픽로 676', website: 'https://paejae.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '한대부속고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 성동구 왕십리로 222', website: 'https://hanyang.sen.hs.kr', features: ['자사고', '서울광역'] },
  { name: '중동고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', address: '서울시 강남구 삼성로 168', website: 'https://choongdong.sen.hs.kr', features: ['자사고', '서울광역'] },
];

async function main() {
  console.log('🏫 전국 특목고/자사고 시드 데이터 삽입 시작...');
  
  const allSchools = [
    ...specializedHighSchools,
    ...autonomousHighSchools,
  ];
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const school of allSchools) {
    try {
      const existing = await prisma.school.findFirst({
        where: { name: school.name, region: school.region },
      });
      
      if (existing) {
        // 업데이트
        await prisma.school.update({
          where: { id: existing.id },
          data: {
            type: school.type,
            address: school.address,
            website: school.website,
            features: JSON.stringify(school.features),
          },
        });
        updated++;
      } else {
        // 새로 생성
        await prisma.school.create({
          data: {
            name: school.name,
            type: school.type,
            region: school.region,
            address: school.address,
            website: school.website,
            features: JSON.stringify(school.features),
            publishStatus: PublishStatus.PUBLISHED, // 시드 데이터는 바로 PUBLISHED
          },
        });
        created++;
      }
    } catch (error: any) {
      console.error(`❌ ${school.name} 처리 실패:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✅ 특목고/자사고 시드 완료: ${created}개 생성, ${updated}개 업데이트, ${skipped}개 건너뜀`);
  console.log(`   - 과학고: ${specializedHighSchools.filter(s => s.type === SchoolType.SCIENCE).length}개`);
  console.log(`   - 외국어고: ${specializedHighSchools.filter(s => s.type === SchoolType.FOREIGN_LANGUAGE).length}개`);
  console.log(`   - 국제고: ${specializedHighSchools.filter(s => s.type === SchoolType.INTERNATIONAL).length}개`);
  console.log(`   - 예술고: ${specializedHighSchools.filter(s => s.type === SchoolType.ARTS).length}개`);
  console.log(`   - 체육고: ${specializedHighSchools.filter(s => s.type === SchoolType.SPORTS).length}개`);
  console.log(`   - 자사고: ${autonomousHighSchools.length}개`);
  
  // 전체 학교 통계
  const stats = await prisma.school.groupBy({
    by: ['type'],
    _count: { id: true },
  });
  
  console.log('\n📊 전체 고등학교 통계:');
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

