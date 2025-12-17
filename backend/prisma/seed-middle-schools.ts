import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// 서울 중학교 데이터 (주요 학교)
const seoulMiddleSchools = [
  // 강남구
  { name: '압구정중학교', region: '서울', district: '강남구', website: 'https://apgujeong.sen.ms.kr' },
  { name: '신사중학교', region: '서울', district: '강남구', website: 'https://sinsa.sen.ms.kr' },
  { name: '언주중학교', region: '서울', district: '강남구', website: 'https://eonju.sen.ms.kr' },
  { name: '역삼중학교', region: '서울', district: '강남구', website: 'https://yeoksam.sen.ms.kr' },
  { name: '대청중학교', region: '서울', district: '강남구', website: 'https://daechung.sen.ms.kr' },
  { name: '대명중학교', region: '서울', district: '강남구', website: 'https://daemyung-m.sen.ms.kr' },
  { name: '단국대학교부속중학교', region: '서울', district: '강남구', website: 'https://dankookms.sen.hs.kr' },
  { name: '도곡중학교', region: '서울', district: '강남구', website: 'https://dogok.sen.ms.kr' },
  { name: '휘문중학교', region: '서울', district: '강남구', website: 'https://hwimoon.sen.ms.kr' },
  { name: '숙명여자중학교', region: '서울', district: '강남구', website: 'https://sookmyung.sen.ms.kr' },
  
  // 서초구
  { name: '서초중학교', region: '서울', district: '서초구', website: 'https://seocho.sen.ms.kr' },
  { name: '반포중학교', region: '서울', district: '서초구', website: 'https://banpo.sen.ms.kr' },
  { name: '세화여자중학교', region: '서울', district: '서초구', website: 'https://sehwa.sen.ms.kr' },
  { name: '원촌중학교', region: '서울', district: '서초구', website: 'https://wonchon.sen.ms.kr' },
  { name: '신반포중학교', region: '서울', district: '서초구', website: 'https://sinbanpo.sen.ms.kr' },
  { name: '잠원중학교', region: '서울', district: '서초구', website: 'https://jamwon.sen.ms.kr' },
  { name: '동덕여자중학교', region: '서울', district: '서초구', website: 'https://dongduk-g.sen.ms.kr' },
  { name: '언남중학교', region: '서울', district: '서초구', website: 'https://eonnam.sen.ms.kr' },
  
  // 송파구
  { name: '잠실중학교', region: '서울', district: '송파구', website: 'https://jamsil.sen.ms.kr' },
  { name: '문정중학교', region: '서울', district: '송파구', website: 'https://munjeong.sen.ms.kr' },
  { name: '가락중학교', region: '서울', district: '송파구', website: 'https://garak.sen.ms.kr' },
  { name: '방이중학교', region: '서울', district: '송파구', website: 'https://bangyi.sen.ms.kr' },
  { name: '오금중학교', region: '서울', district: '송파구', website: 'https://ogeum.sen.ms.kr' },
  { name: '송파중학교', region: '서울', district: '송파구', website: 'https://songpa.sen.ms.kr' },
  { name: '풍납중학교', region: '서울', district: '송파구', website: 'https://pungnap.sen.ms.kr' },
  { name: '배명중학교', region: '서울', district: '송파구', website: 'https://baemyung.sen.ms.kr' },
  
  // 강동구
  { name: '강동중학교', region: '서울', district: '강동구', website: 'https://gangdong.sen.ms.kr' },
  { name: '명일중학교', region: '서울', district: '강동구', website: 'https://myungil.sen.ms.kr' },
  { name: '천호중학교', region: '서울', district: '강동구', website: 'https://chunho.sen.ms.kr' },
  { name: '둔촌중학교', region: '서울', district: '강동구', website: 'https://dunchon.sen.ms.kr' },
  { name: '강일중학교', region: '서울', district: '강동구', website: 'https://gangil.sen.ms.kr' },
  
  // 강서구
  { name: '강서중학교', region: '서울', district: '강서구', website: 'https://gangseo.sen.ms.kr' },
  { name: '마곡중학교', region: '서울', district: '강서구', website: 'https://magok.sen.ms.kr' },
  { name: '화곡중학교', region: '서울', district: '강서구', website: 'https://hwagok.sen.ms.kr' },
  { name: '공항중학교', region: '서울', district: '강서구', website: 'https://gonghang.sen.ms.kr' },
  { name: '방화중학교', region: '서울', district: '강서구', website: 'https://banghwa.sen.ms.kr' },
  
  // 양천구
  { name: '목동중학교', region: '서울', district: '양천구', website: 'https://mokdong.sen.ms.kr' },
  { name: '신목중학교', region: '서울', district: '양천구', website: 'https://shinmok.sen.ms.kr' },
  { name: '월촌중학교', region: '서울', district: '양천구', website: 'https://wolchon.sen.ms.kr' },
  { name: '신서중학교', region: '서울', district: '양천구', website: 'https://sinseo.sen.ms.kr' },
  { name: '양천중학교', region: '서울', district: '양천구', website: 'https://yangcheon.sen.ms.kr' },
  
  // 영등포구
  { name: '영등포중학교', region: '서울', district: '영등포구', website: 'https://yeongdeungpo.sen.ms.kr' },
  { name: '당산중학교', region: '서울', district: '영등포구', website: 'https://dangsan.sen.ms.kr' },
  { name: '여의도중학교', region: '서울', district: '영등포구', website: 'https://yeoido.sen.ms.kr' },
  { name: '영일중학교', region: '서울', district: '영등포구', website: 'https://youngil.sen.ms.kr' },
  
  // 마포구
  { name: '서강중학교', region: '서울', district: '마포구', website: 'https://seogang.sen.ms.kr' },
  { name: '상암중학교', region: '서울', district: '마포구', website: 'https://sangam.sen.ms.kr' },
  { name: '홍대부속중학교', region: '서울', district: '마포구', website: 'https://hongdae.sen.ms.kr' },
  { name: '마포중학교', region: '서울', district: '마포구', website: 'https://mapo.sen.ms.kr' },
  { name: '서울여자중학교', region: '서울', district: '마포구', website: 'https://seoulyeoja.sen.ms.kr' },
  
  // 용산구
  { name: '용산중학교', region: '서울', district: '용산구', website: 'https://yongsan.sen.ms.kr' },
  { name: '보광중학교', region: '서울', district: '용산구', website: 'https://bogwang.sen.ms.kr' },
  { name: '이태원중학교', region: '서울', district: '용산구', website: 'https://itaewon.sen.ms.kr' },
  { name: '한강중학교', region: '서울', district: '용산구', website: 'https://hangang.sen.ms.kr' },
  
  // 노원구
  { name: '노원중학교', region: '서울', district: '노원구', website: 'https://nowon.sen.ms.kr' },
  { name: '상계중학교', region: '서울', district: '노원구', website: 'https://sanggye.sen.ms.kr' },
  { name: '중계중학교', region: '서울', district: '노원구', website: 'https://junggye.sen.ms.kr' },
  { name: '월계중학교', region: '서울', district: '노원구', website: 'https://wolgye.sen.ms.kr' },
  { name: '하계중학교', region: '서울', district: '노원구', website: 'https://hagye.sen.ms.kr' },
  
  // 도봉구
  { name: '도봉중학교', region: '서울', district: '도봉구', website: 'https://dobong.sen.ms.kr' },
  { name: '창동중학교', region: '서울', district: '도봉구', website: 'https://changdong.sen.ms.kr' },
  { name: '쌍문중학교', region: '서울', district: '도봉구', website: 'https://ssangmun.sen.ms.kr' },
  
  // 강북구
  { name: '강북중학교', region: '서울', district: '강북구', website: 'https://gangbuk.sen.ms.kr' },
  { name: '수유중학교', region: '서울', district: '강북구', website: 'https://suyu.sen.ms.kr' },
  { name: '미아중학교', region: '서울', district: '강북구', website: 'https://mia.sen.ms.kr' },
  
  // 성북구
  { name: '성북중학교', region: '서울', district: '성북구', website: 'https://seongbuk.sen.ms.kr' },
  { name: '고려대학교부속중학교', region: '서울', district: '성북구', website: 'https://koryo.sen.ms.kr' },
  { name: '성신여자중학교', region: '서울', district: '성북구', website: 'https://sungshin.sen.ms.kr' },
  { name: '돈암중학교', region: '서울', district: '성북구', website: 'https://donam.sen.ms.kr' },
  
  // 중랑구
  { name: '중랑중학교', region: '서울', district: '중랑구', website: 'https://jungnang.sen.ms.kr' },
  { name: '신현중학교', region: '서울', district: '중랑구', website: 'https://sinhyun.sen.ms.kr' },
  { name: '면목중학교', region: '서울', district: '중랑구', website: 'https://myunmok.sen.ms.kr' },
  
  // 동대문구
  { name: '동대문중학교', region: '서울', district: '동대문구', website: 'https://dongdaemun.sen.ms.kr' },
  { name: '장안중학교', region: '서울', district: '동대문구', website: 'https://jangan.sen.ms.kr' },
  { name: '휘경중학교', region: '서울', district: '동대문구', website: 'https://hwikyung.sen.ms.kr' },
  { name: '경희중학교', region: '서울', district: '동대문구', website: 'https://kyunghee.sen.ms.kr' },
  
  // 광진구
  { name: '광장중학교', region: '서울', district: '광진구', website: 'https://gwangjang.sen.ms.kr' },
  { name: '건국대학교부속중학교', region: '서울', district: '광진구', website: 'https://konkuk.sen.ms.kr' },
  { name: '자양중학교', region: '서울', district: '광진구', website: 'https://jayang.sen.ms.kr' },
  { name: '동국대학교부속중학교', region: '서울', district: '광진구', website: 'https://dongguk-m.sen.ms.kr' },
  
  // 성동구
  { name: '성동중학교', region: '서울', district: '성동구', website: 'https://seongdong.sen.ms.kr' },
  { name: '옥수중학교', region: '서울', district: '성동구', website: 'https://oksu.sen.ms.kr' },
  { name: '한양대학교부속중학교', region: '서울', district: '성동구', website: 'https://hanyang-m.sen.ms.kr' },
  { name: '무학중학교', region: '서울', district: '성동구', website: 'https://muhak.sen.ms.kr' },
  
  // 종로구
  { name: '종로중학교', region: '서울', district: '종로구', website: 'https://jongno.sen.ms.kr' },
  { name: '창덕여자중학교', region: '서울', district: '종로구', website: 'https://changduk.sen.ms.kr' },
  { name: '서울대학교사범대학부속중학교', region: '서울', district: '종로구', website: 'https://snu-ms.sen.hs.kr' },
  
  // 중구
  { name: '중구중학교', region: '서울', district: '중구', website: 'https://junggu.sen.ms.kr' },
  { name: '장충중학교', region: '서울', district: '중구', website: 'https://jangchung.sen.ms.kr' },
  
  // 관악구
  { name: '관악중학교', region: '서울', district: '관악구', website: 'https://gwanak.sen.ms.kr' },
  { name: '신림중학교', region: '서울', district: '관악구', website: 'https://sinlim.sen.ms.kr' },
  { name: '서울사대부설중학교', region: '서울', district: '관악구', website: 'https://snue.sen.ms.kr' },
  { name: '봉천중학교', region: '서울', district: '관악구', website: 'https://bongcheon.sen.ms.kr' },
  
  // 동작구
  { name: '동작중학교', region: '서울', district: '동작구', website: 'https://dongjak.sen.ms.kr' },
  { name: '노량진중학교', region: '서울', district: '동작구', website: 'https://noryangjin.sen.ms.kr' },
  { name: '상도중학교', region: '서울', district: '동작구', website: 'https://sangdo.sen.ms.kr' },
  { name: '사당중학교', region: '서울', district: '동작구', website: 'https://sadang.sen.ms.kr' },
  
  // 금천구
  { name: '금천중학교', region: '서울', district: '금천구', website: 'https://geumcheon.sen.ms.kr' },
  { name: '시흥중학교', region: '서울', district: '금천구', website: 'https://siheung.sen.ms.kr' },
  
  // 구로구
  { name: '구로중학교', region: '서울', district: '구로구', website: 'https://guro.sen.ms.kr' },
  { name: '신도림중학교', region: '서울', district: '구로구', website: 'https://sindorim.sen.ms.kr' },
  { name: '항동중학교', region: '서울', district: '구로구', website: 'https://hangdong.sen.ms.kr' },
  
  // 은평구
  { name: '은평중학교', region: '서울', district: '은평구', website: 'https://eunpyeong.sen.ms.kr' },
  { name: '응암중학교', region: '서울', district: '은평구', website: 'https://eungam.sen.ms.kr' },
  { name: '불광중학교', region: '서울', district: '은평구', website: 'https://bulgwang.sen.ms.kr' },
  { name: '진관중학교', region: '서울', district: '은평구', website: 'https://jingwan.sen.ms.kr' },
  
  // 서대문구
  { name: '연희중학교', region: '서울', district: '서대문구', website: 'https://yeonhee.sen.ms.kr' },
  { name: '이화여자대학교부속중학교', region: '서울', district: '서대문구', website: 'https://ewha-m.sen.ms.kr' },
  { name: '홍은중학교', region: '서울', district: '서대문구', website: 'https://hongeun.sen.ms.kr' },
  { name: '가재울중학교', region: '서울', district: '서대문구', website: 'https://gajeul.sen.ms.kr' },
];

// 인천 중학교 데이터 (주요 학교)
const incheonMiddleSchools = [
  // 남동구
  { name: '남동중학교', region: '인천', district: '남동구', website: 'https://namdong.ice.ms.kr' },
  { name: '인천논현중학교', region: '인천', district: '남동구', website: 'https://nonhyun.ice.ms.kr' },
  { name: '인천구월중학교', region: '인천', district: '남동구', website: 'https://guwol.ice.ms.kr' },
  { name: '인천만수중학교', region: '인천', district: '남동구', website: 'https://mansu.ice.ms.kr' },
  { name: '인천소래중학교', region: '인천', district: '남동구', website: 'https://sorae.ice.ms.kr' },
  { name: '인천간석중학교', region: '인천', district: '남동구', website: 'https://ganseok.ice.ms.kr' },
  
  // 연수구
  { name: '인천연수중학교', region: '인천', district: '연수구', website: 'https://yeonsu.ice.ms.kr' },
  { name: '인천송도중학교', region: '인천', district: '연수구', website: 'https://songdo.ice.ms.kr' },
  { name: '인천신송중학교', region: '인천', district: '연수구', website: 'https://sinsong.ice.ms.kr' },
  { name: '인천청량중학교', region: '인천', district: '연수구', website: 'https://cheongyang.ice.ms.kr' },
  { name: '인천연송중학교', region: '인천', district: '연수구', website: 'https://yeonsong.ice.ms.kr' },
  { name: '인천해송중학교', region: '인천', district: '연수구', website: 'https://haesong.ice.ms.kr' },
  
  // 부평구
  { name: '인천부평중학교', region: '인천', district: '부평구', website: 'https://bupyeong.ice.ms.kr' },
  { name: '인천부평서중학교', region: '인천', district: '부평구', website: 'https://bupyeongseo.ice.ms.kr' },
  { name: '인천산곡중학교', region: '인천', district: '부평구', website: 'https://sangok.ice.ms.kr' },
  { name: '인천삼산중학교', region: '인천', district: '부평구', website: 'https://samsan.ice.ms.kr' },
  { name: '인천부평여자중학교', region: '인천', district: '부평구', website: 'https://bupyeongyeoja.ice.ms.kr' },
  
  // 계양구
  { name: '인천계양중학교', region: '인천', district: '계양구', website: 'https://gyeyang.ice.ms.kr' },
  { name: '인천계산중학교', region: '인천', district: '계양구', website: 'https://gyesan.ice.ms.kr' },
  { name: '인천작전중학교', region: '인천', district: '계양구', website: 'https://jakjeon.ice.ms.kr' },
  { name: '인천효성중학교', region: '인천', district: '계양구', website: 'https://hyosung.ice.ms.kr' },
  
  // 미추홀구
  { name: '인천미추홀중학교', region: '인천', district: '미추홀구', website: 'https://michuhol.ice.ms.kr' },
  { name: '인천학익중학교', region: '인천', district: '미추홀구', website: 'https://hagik.ice.ms.kr' },
  { name: '인천주안중학교', region: '인천', district: '미추홀구', website: 'https://juan.ice.ms.kr' },
  { name: '인천도화중학교', region: '인천', district: '미추홀구', website: 'https://dohwa.ice.ms.kr' },
  { name: '인천숭의중학교', region: '인천', district: '미추홀구', website: 'https://sungui.ice.ms.kr' },
  
  // 서구
  { name: '인천서곶중학교', region: '인천', district: '서구', website: 'https://seogot.ice.ms.kr' },
  { name: '인천청라중학교', region: '인천', district: '서구', website: 'https://cheongna.ice.ms.kr' },
  { name: '인천가정중학교', region: '인천', district: '서구', website: 'https://gajeong.ice.ms.kr' },
  { name: '인천검단중학교', region: '인천', district: '서구', website: 'https://geomdan.ice.ms.kr' },
  { name: '인천루원중학교', region: '인천', district: '서구', website: 'https://ruwon.ice.ms.kr' },
  { name: '인천마전중학교', region: '인천', district: '서구', website: 'https://majeon.ice.ms.kr' },
  
  // 중구
  { name: '인천중앙중학교', region: '인천', district: '중구', website: 'https://jungang.ice.ms.kr' },
  { name: '인천영종중학교', region: '인천', district: '중구', website: 'https://yeongjong.ice.ms.kr' },
  { name: '인천운서중학교', region: '인천', district: '중구', website: 'https://unseo.ice.ms.kr' },
  
  // 동구
  { name: '인천동인천중학교', region: '인천', district: '동구', website: 'https://dongincheon.ice.ms.kr' },
  { name: '인천송림중학교', region: '인천', district: '동구', website: 'https://songrim.ice.ms.kr' },
  
  // 강화군
  { name: '강화중학교', region: '인천', district: '강화군', website: 'https://ganghwa.ice.ms.kr' },
  { name: '인천해명중학교', region: '인천', district: '강화군', website: 'https://haemyeong.ice.ms.kr' },
  
  // 옹진군
  { name: '영흥중학교', region: '인천', district: '옹진군', website: 'https://yeongheung.ice.ms.kr' },
];

async function main() {
  console.log('🏫 중학교 시드 데이터 삽입 시작...');
  
  const allSchools = [...seoulMiddleSchools, ...incheonMiddleSchools];
  
  let created = 0;
  let skipped = 0;
  
  for (const school of allSchools) {
    try {
      await prisma.middleSchool.upsert({
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
        create: {
          name: school.name,
          region: school.region,
          district: school.district,
          website: school.website,
        },
      });
      created++;
    } catch (error) {
      console.error(`❌ ${school.name} 삽입 실패:`, error);
      skipped++;
    }
  }
  
  console.log(`✅ 중학교 시드 완료: ${created}개 생성/업데이트, ${skipped}개 건너뜀`);
  console.log(`   - 서울: ${seoulMiddleSchools.length}개`);
  console.log(`   - 인천: ${incheonMiddleSchools.length}개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




