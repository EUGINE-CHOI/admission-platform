/**
 * 경기도 중학교 데이터 시드
 * 주요 도시: 성남, 수원, 용인, 고양, 안양, 부천
 */

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const gyeonggiMiddleSchools = [
  // ==================== 성남시 분당구 ====================
  { name: '분당중학교', region: '경기', district: '성남시 분당구', website: 'https://bundang.goehs.kr' },
  { name: '수내중학교', region: '경기', district: '성남시 분당구', website: 'https://sunae.goehs.kr' },
  { name: '내정중학교', region: '경기', district: '성남시 분당구', website: 'https://naejeong.goehs.kr' },
  { name: '정자중학교', region: '경기', district: '성남시 분당구', website: 'https://jeongja.goehs.kr' },
  { name: '서현중학교', region: '경기', district: '성남시 분당구', website: 'https://seohyeon.goehs.kr' },
  { name: '이매중학교', region: '경기', district: '성남시 분당구', website: 'https://imae.goehs.kr' },
  { name: '야탑중학교', region: '경기', district: '성남시 분당구', website: 'https://yatap.goehs.kr' },
  { name: '불곡중학교', region: '경기', district: '성남시 분당구', website: 'https://bulgok.goehs.kr' },
  { name: '늘푸른중학교', region: '경기', district: '성남시 분당구', website: 'https://neulpureun.goehs.kr' },
  { name: '백현중학교', region: '경기', district: '성남시 분당구', website: 'https://baekhyeon.goehs.kr' },
  { name: '판교중학교', region: '경기', district: '성남시 분당구', website: 'https://pangyo.goehs.kr' },
  { name: '보평중학교', region: '경기', district: '성남시 분당구', website: 'https://bopyeong.goehs.kr' },
  
  // ==================== 성남시 수정구/중원구 ====================
  { name: '성남중학교', region: '경기', district: '성남시 수정구', website: 'https://seongnam.goehs.kr' },
  { name: '태평중학교', region: '경기', district: '성남시 수정구', website: 'https://taepyeong.goehs.kr' },
  { name: '수진중학교', region: '경기', district: '성남시 수정구', website: 'https://sujin.goehs.kr' },
  { name: '중원중학교', region: '경기', district: '성남시 중원구', website: 'https://jungwon.goehs.kr' },
  { name: '성일중학교', region: '경기', district: '성남시 중원구', website: 'https://seongil.goehs.kr' },

  // ==================== 용인시 수지구 ====================
  { name: '수지중학교', region: '경기', district: '용인시 수지구', website: 'https://suji.goehs.kr' },
  { name: '손곡중학교', region: '경기', district: '용인시 수지구', website: 'https://songok.goehs.kr' },
  { name: '정평중학교', region: '경기', district: '용인시 수지구', website: 'https://jeongpyeong.goehs.kr' },
  { name: '심곡중학교', region: '경기', district: '용인시 수지구', website: 'https://simgok.goehs.kr' },
  { name: '성복중학교', region: '경기', district: '용인시 수지구', website: 'https://seongbok.goehs.kr' },
  { name: '풍덕중학교', region: '경기', district: '용인시 수지구', website: 'https://pungdeok.goehs.kr' },
  { name: '상현중학교', region: '경기', district: '용인시 수지구', website: 'https://sanghyeon.goehs.kr' },
  { name: '이현중학교', region: '경기', district: '용인시 수지구', website: 'https://ihyeon.goehs.kr' },
  { name: '신봉중학교', region: '경기', district: '용인시 수지구', website: 'https://sinbong.goehs.kr' },

  // ==================== 용인시 기흥구 ====================
  { name: '기흥중학교', region: '경기', district: '용인시 기흥구', website: 'https://giheung.goehs.kr' },
  { name: '보정중학교', region: '경기', district: '용인시 기흥구', website: 'https://bojeong.goehs.kr' },
  { name: '신갈중학교', region: '경기', district: '용인시 기흥구', website: 'https://singal.goehs.kr' },
  { name: '언남중학교', region: '경기', district: '용인시 기흥구', website: 'https://eonnam.goehs.kr' },
  { name: '마북중학교', region: '경기', district: '용인시 기흥구', website: 'https://mabuk.goehs.kr' },
  { name: '구성중학교', region: '경기', district: '용인시 기흥구', website: 'https://guseong.goehs.kr' },
  { name: '동백중학교', region: '경기', district: '용인시 기흥구', website: 'https://dongbaek.goehs.kr' },

  // ==================== 용인시 처인구 ====================
  { name: '용인중학교', region: '경기', district: '용인시 처인구', website: 'https://yongin.goehs.kr' },
  { name: '삼가중학교', region: '경기', district: '용인시 처인구', website: 'https://samga.goehs.kr' },

  // ==================== 수원시 영통구 ====================
  { name: '영통중학교', region: '경기', district: '수원시 영통구', website: 'https://yeongtong.goehs.kr' },
  { name: '영일중학교', region: '경기', district: '수원시 영통구', website: 'https://yeongil.goehs.kr' },
  { name: '대영중학교', region: '경기', district: '수원시 영통구', website: 'https://daeyeong.goehs.kr' },
  { name: '수원중학교', region: '경기', district: '수원시 영통구', website: 'https://suwon.goehs.kr' },
  { name: '청명중학교', region: '경기', district: '수원시 영통구', website: 'https://cheongmyeong.goehs.kr' },
  { name: '원천중학교', region: '경기', district: '수원시 영통구', website: 'https://woncheon.goehs.kr' },
  { name: '망포중학교', region: '경기', district: '수원시 영통구', website: 'https://mangpo.goehs.kr' },

  // ==================== 수원시 권선구 ====================
  { name: '권선중학교', region: '경기', district: '수원시 권선구', website: 'https://gwonseon.goehs.kr' },
  { name: '곡선중학교', region: '경기', district: '수원시 권선구', website: 'https://gokseon.goehs.kr' },
  { name: '호매실중학교', region: '경기', district: '수원시 권선구', website: 'https://homaesil.goehs.kr' },
  { name: '세류중학교', region: '경기', district: '수원시 권선구', website: 'https://seryu.goehs.kr' },

  // ==================== 수원시 장안구 ====================
  { name: '장안중학교', region: '경기', district: '수원시 장안구', website: 'https://jangan.goehs.kr' },
  { name: '정자중학교', region: '경기', district: '수원시 장안구', website: 'https://jeongja-sw.goehs.kr' },
  { name: '천천중학교', region: '경기', district: '수원시 장안구', website: 'https://cheoncheon.goehs.kr' },
  { name: '율전중학교', region: '경기', district: '수원시 장안구', website: 'https://yuljeon.goehs.kr' },

  // ==================== 수원시 팔달구 ====================
  { name: '팔달중학교', region: '경기', district: '수원시 팔달구', website: 'https://paldal.goehs.kr' },
  { name: '화홍중학교', region: '경기', district: '수원시 팔달구', website: 'https://hwahong.goehs.kr' },
  { name: '매원중학교', region: '경기', district: '수원시 팔달구', website: 'https://maewon.goehs.kr' },

  // ==================== 고양시 일산동구 ====================
  { name: '백석중학교', region: '경기', district: '고양시 일산동구', website: 'https://baekseok.goehs.kr' },
  { name: '마두중학교', region: '경기', district: '고양시 일산동구', website: 'https://madu.goehs.kr' },
  { name: '정발중학교', region: '경기', district: '고양시 일산동구', website: 'https://jeongbal.goehs.kr' },
  { name: '장항중학교', region: '경기', district: '고양시 일산동구', website: 'https://janghang.goehs.kr' },
  { name: '풍동중학교', region: '경기', district: '고양시 일산동구', website: 'https://pungdong.goehs.kr' },
  { name: '백마중학교', region: '경기', district: '고양시 일산동구', website: 'https://baekma.goehs.kr' },

  // ==================== 고양시 일산서구 ====================
  { name: '일산중학교', region: '경기', district: '고양시 일산서구', website: 'https://ilsan.goehs.kr' },
  { name: '주엽중학교', region: '경기', district: '고양시 일산서구', website: 'https://juyeop.goehs.kr' },
  { name: '대화중학교', region: '경기', district: '고양시 일산서구', website: 'https://daehwa.goehs.kr' },
  { name: '가좌중학교', region: '경기', district: '고양시 일산서구', website: 'https://gajwa-gy.goehs.kr' },
  { name: '탄현중학교', region: '경기', district: '고양시 일산서구', website: 'https://tanhyeon.goehs.kr' },

  // ==================== 고양시 덕양구 ====================
  { name: '덕양중학교', region: '경기', district: '고양시 덕양구', website: 'https://deokyang.goehs.kr' },
  { name: '행신중학교', region: '경기', district: '고양시 덕양구', website: 'https://haengsin.goehs.kr' },
  { name: '능곡중학교', region: '경기', district: '고양시 덕양구', website: 'https://neunggok.goehs.kr' },
  { name: '화정중학교', region: '경기', district: '고양시 덕양구', website: 'https://hwajeong.goehs.kr' },
  { name: '원당중학교', region: '경기', district: '고양시 덕양구', website: 'https://wondang.goehs.kr' },
  { name: '삼송중학교', region: '경기', district: '고양시 덕양구', website: 'https://samsong.goehs.kr' },

  // ==================== 안양시 ====================
  { name: '안양중학교', region: '경기', district: '안양시 만안구', website: 'https://anyang.goehs.kr' },
  { name: '평촌중학교', region: '경기', district: '안양시 동안구', website: 'https://pyeongchon.goehs.kr' },
  { name: '범계중학교', region: '경기', district: '안양시 동안구', website: 'https://beomgye.goehs.kr' },
  { name: '귀인중학교', region: '경기', district: '안양시 동안구', website: 'https://guiin.goehs.kr' },
  { name: '부흥중학교', region: '경기', district: '안양시 동안구', website: 'https://buheung.goehs.kr' },
  { name: '관양중학교', region: '경기', district: '안양시 동안구', website: 'https://gwanyang.goehs.kr' },
  { name: '호계중학교', region: '경기', district: '안양시 동안구', website: 'https://hogye.goehs.kr' },

  // ==================== 부천시 ====================
  { name: '부천중학교', region: '경기', district: '부천시', website: 'https://bucheon.goehs.kr' },
  { name: '중원중학교', region: '경기', district: '부천시', website: 'https://jungwon-bc.goehs.kr' },
  { name: '상동중학교', region: '경기', district: '부천시', website: 'https://sangdong.goehs.kr' },
  { name: '송내중학교', region: '경기', district: '부천시', website: 'https://songnae.goehs.kr' },
  { name: '역곡중학교', region: '경기', district: '부천시', website: 'https://yeokgok.goehs.kr' },
  { name: '소사중학교', region: '경기', district: '부천시', website: 'https://sosa.goehs.kr' },
  { name: '원미중학교', region: '경기', district: '부천시', website: 'https://wonmi.goehs.kr' },
  { name: '심곡중학교', region: '경기', district: '부천시', website: 'https://simgok-bc.goehs.kr' },

  // ==================== 화성시 ====================
  { name: '동탄중학교', region: '경기', district: '화성시', website: 'https://dongtan.goehs.kr' },
  { name: '반송중학교', region: '경기', district: '화성시', website: 'https://bansong.goehs.kr' },
  { name: '능동중학교', region: '경기', district: '화성시', website: 'https://neungdong.goehs.kr' },
  { name: '청계중학교', region: '경기', district: '화성시', website: 'https://cheonggye.goehs.kr' },
  { name: '동탄목동중학교', region: '경기', district: '화성시', website: 'https://dongtanmokdong.goehs.kr' },
  { name: '솔빛중학교', region: '경기', district: '화성시', website: 'https://solbit.goehs.kr' },

  // ==================== 광명시 ====================
  { name: '광명중학교', region: '경기', district: '광명시', website: 'https://gwangmyeong.goehs.kr' },
  { name: '철산중학교', region: '경기', district: '광명시', website: 'https://cheolsan.goehs.kr' },
  { name: '광문중학교', region: '경기', district: '광명시', website: 'https://gwangmun.goehs.kr' },
  { name: '하안중학교', region: '경기', district: '광명시', website: 'https://haan.goehs.kr' },

  // ==================== 시흥시 ====================
  { name: '시흥중학교', region: '경기', district: '시흥시', website: 'https://siheung.goehs.kr' },
  { name: '정왕중학교', region: '경기', district: '시흥시', website: 'https://jeongwang.goehs.kr' },
  { name: '배곧중학교', region: '경기', district: '시흥시', website: 'https://baegot.goehs.kr' },
  { name: '장곡중학교', region: '경기', district: '시흥시', website: 'https://janggok.goehs.kr' },

  // ==================== 군포시 ====================
  { name: '군포중학교', region: '경기', district: '군포시', website: 'https://gunpo.goehs.kr' },
  { name: '산본중학교', region: '경기', district: '군포시', website: 'https://sanbon.goehs.kr' },
  { name: '수리중학교', region: '경기', district: '군포시', website: 'https://suri.goehs.kr' },
  { name: '당동중학교', region: '경기', district: '군포시', website: 'https://dangdong.goehs.kr' },

  // ==================== 의왕시 ====================
  { name: '의왕중학교', region: '경기', district: '의왕시', website: 'https://uiwang.goehs.kr' },
  { name: '백운중학교', region: '경기', district: '의왕시', website: 'https://baekun.goehs.kr' },
  { name: '오전중학교', region: '경기', district: '의왕시', website: 'https://ojeon.goehs.kr' },

  // ==================== 하남시 ====================
  { name: '하남중학교', region: '경기', district: '하남시', website: 'https://hanam.goehs.kr' },
  { name: '미사중학교', region: '경기', district: '하남시', website: 'https://misa.goehs.kr' },
  { name: '위례중학교', region: '경기', district: '하남시', website: 'https://wirye.goehs.kr' },
  { name: '덕풍중학교', region: '경기', district: '하남시', website: 'https://deokpung.goehs.kr' },

  // ==================== 과천시 ====================
  { name: '과천중학교', region: '경기', district: '과천시', website: 'https://gwacheon.goehs.kr' },
  { name: '문원중학교', region: '경기', district: '과천시', website: 'https://munwon.goehs.kr' },

  // ==================== 구리시 ====================
  { name: '구리중학교', region: '경기', district: '구리시', website: 'https://guri.goehs.kr' },
  { name: '인창중학교', region: '경기', district: '구리시', website: 'https://inchang.goehs.kr' },
  { name: '동구중학교', region: '경기', district: '구리시', website: 'https://donggu.goehs.kr' },

  // ==================== 남양주시 ====================
  { name: '남양주중학교', region: '경기', district: '남양주시', website: 'https://namyangju.goehs.kr' },
  { name: '별내중학교', region: '경기', district: '남양주시', website: 'https://byeollnae.goehs.kr' },
  { name: '다산중학교', region: '경기', district: '남양주시', website: 'https://dasan.goehs.kr' },
  { name: '호평중학교', region: '경기', district: '남양주시', website: 'https://hopyeong.goehs.kr' },

  // ==================== 파주시 ====================
  { name: '운정중학교', region: '경기', district: '파주시', website: 'https://unjeong.goehs.kr' },
  { name: '해솔중학교', region: '경기', district: '파주시', website: 'https://haesol.goehs.kr' },
  { name: '금촌중학교', region: '경기', district: '파주시', website: 'https://geumchon.goehs.kr' },
  { name: '문산중학교', region: '경기', district: '파주시', website: 'https://munsan.goehs.kr' },

  // ==================== 김포시 ====================
  { name: '김포중학교', region: '경기', district: '김포시', website: 'https://gimpo.goehs.kr' },
  { name: '사우중학교', region: '경기', district: '김포시', website: 'https://sau.goehs.kr' },
  { name: '고촌중학교', region: '경기', district: '김포시', website: 'https://gochon.goehs.kr' },
  { name: '장기중학교', region: '경기', district: '김포시', website: 'https://janggi.goehs.kr' },

  // ==================== 의정부시 ====================
  { name: '의정부중학교', region: '경기', district: '의정부시', website: 'https://uijeongbu.goehs.kr' },
  { name: '호원중학교', region: '경기', district: '의정부시', website: 'https://howon.goehs.kr' },
  { name: '민락중학교', region: '경기', district: '의정부시', website: 'https://minrak.goehs.kr' },
  { name: '발곡중학교', region: '경기', district: '의정부시', website: 'https://balgok.goehs.kr' },
];

async function seedGyeonggiMiddleSchools() {
  console.log('🏫 경기도 중학교 데이터 시드 시작...\n');

  let created = 0;
  let updated = 0;

  for (const school of gyeonggiMiddleSchools) {
    const result = await prisma.middleSchool.upsert({
      where: {
        name_region: {
          name: school.name,
          region: school.region,
        },
      },
      update: {
        district: school.district,
        website: school.website,
      },
      create: school,
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`✅ 경기도 중학교 시드 완료!`);
  console.log(`   생성: ${created}개`);
  console.log(`   업데이트: ${updated}개`);
  console.log(`   총: ${gyeonggiMiddleSchools.length}개`);

  // 통계
  const stats = await prisma.middleSchool.groupBy({
    by: ['region'],
    _count: { id: true },
  });

  console.log('\n📊 지역별 중학교 수:');
  for (const stat of stats) {
    console.log(`   ${stat.region}: ${stat._count.id}개`);
  }

  const total = await prisma.middleSchool.count();
  console.log(`\n   총 중학교: ${total}개`);

  await prisma.$disconnect();
}

seedGyeonggiMiddleSchools().catch(console.error);





