/**
 * 전국 특목고/자사고 완전 데이터 시드
 * 과학고, 외국어고, 국제고, 예술고, 체육고, 자사고
 */

import { PrismaClient, SchoolType, PublishStatus } from '../generated/prisma';

const prisma = new PrismaClient();

const allSpecialSchools = [
  // ==================== 과학고 (20개) ====================
  // 서울
  { name: '서울과학고등학교', type: SchoolType.SCIENCE, region: '서울', website: 'https://sshs.sen.hs.kr' },
  { name: '한성과학고등학교', type: SchoolType.SCIENCE, region: '서울', website: 'https://hansung.sen.hs.kr' },
  { name: '세종과학고등학교', type: SchoolType.SCIENCE, region: '서울', website: 'https://sjsh.sen.hs.kr' },
  // 경기
  { name: '경기과학고등학교', type: SchoolType.SCIENCE, region: '경기', website: 'https://gs.goe.go.kr' },
  { name: '경기북과학고등학교', type: SchoolType.SCIENCE, region: '경기', website: 'https://gbsh.goe.go.kr' },
  // 인천
  { name: '인천과학고등학교', type: SchoolType.SCIENCE, region: '인천', website: 'https://isch.icems.kr' },
  // 부산
  { name: '한국과학영재학교', type: SchoolType.SCIENCE, region: '부산', website: 'https://www.ksa.hs.kr' },
  { name: '부산과학고등학교', type: SchoolType.SCIENCE, region: '부산', website: 'https://bssh.pen.ms.kr' },
  // 대구
  { name: '대구과학고등학교', type: SchoolType.SCIENCE, region: '대구', website: 'https://dgsh.dge.hs.kr' },
  // 광주
  { name: '광주과학고등학교', type: SchoolType.SCIENCE, region: '광주', website: 'https://gssh.gen.hs.kr' },
  // 대전
  { name: '대전과학고등학교', type: SchoolType.SCIENCE, region: '대전', website: 'https://djsh.dje.go.kr' },
  // 울산
  { name: '울산과학고등학교', type: SchoolType.SCIENCE, region: '울산', website: 'https://ussh.use.go.kr' },
  // 세종
  { name: '세종과학예술영재학교', type: SchoolType.SCIENCE, region: '세종', website: 'https://sasa.sje.go.kr' },
  // 강원
  { name: '강원과학고등학교', type: SchoolType.SCIENCE, region: '강원', website: 'https://kwsh.gwe.go.kr' },
  // 충북
  { name: '충북과학고등학교', type: SchoolType.SCIENCE, region: '충북', website: 'https://cbsh.cbe.go.kr' },
  // 충남
  { name: '충남과학고등학교', type: SchoolType.SCIENCE, region: '충남', website: 'https://cnsh.cne.go.kr' },
  // 전북
  { name: '전북과학고등학교', type: SchoolType.SCIENCE, region: '전북', website: 'https://jbsh.jbe.go.kr' },
  // 전남
  { name: '전남과학고등학교', type: SchoolType.SCIENCE, region: '전남', website: 'https://jnsh.jne.go.kr' },
  // 경북
  { name: '경북과학고등학교', type: SchoolType.SCIENCE, region: '경북', website: 'https://kbsh.gbe.go.kr' },
  // 경남
  { name: '경남과학고등학교', type: SchoolType.SCIENCE, region: '경남', website: 'https://gnsh.gne.go.kr' },
  // 제주
  { name: '제주과학고등학교', type: SchoolType.SCIENCE, region: '제주', website: 'https://jjsh.jje.go.kr' },

  // ==================== 외국어고 (31개) ====================
  // 서울 (7개)
  { name: '대원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://dwfl.sen.hs.kr' },
  { name: '대일외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://diofl.sen.hs.kr' },
  { name: '명덕외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://myfl.sen.hs.kr' },
  { name: '서울외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://sfl.sen.hs.kr' },
  { name: '이화외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://ewfl.sen.hs.kr' },
  { name: '한영외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://hyfl.sen.hs.kr' },
  { name: '한국외국어대학교부속외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '서울', website: 'https://hafs.hs.kr' },
  // 경기 (9개)
  { name: '경기외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://gifl.hs.kr' },
  { name: '고양외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://gofl.hs.kr' },
  { name: '과천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://gcfl.hs.kr' },
  { name: '김포외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://gpfl.hs.kr' },
  { name: '동두천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://ddcfl.hs.kr' },
  { name: '성남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://snfl.hs.kr' },
  { name: '수원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://swfl.hs.kr' },
  { name: '안양외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://ayfl.hs.kr' },
  { name: '용인외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경기', website: 'https://yifl.hs.kr' },
  // 인천 (1개)
  { name: '인천외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '인천', website: 'https://icfl.icems.kr' },
  // 부산 (2개)
  { name: '부산외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '부산', website: 'https://bsfl.pen.hs.kr' },
  { name: '부일외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '부산', website: 'https://bifl.pen.hs.kr' },
  // 대구 (2개)
  { name: '대구외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '대구', website: 'https://dgfl.dge.hs.kr' },
  { name: '대건외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '대구', website: 'https://dkfl.dge.hs.kr' },
  // 광주 (2개)
  { name: '전남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '광주', website: 'https://jnfl.gen.hs.kr' },
  { name: '광주외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '광주', website: 'https://gjfl.gen.hs.kr' },
  // 대전 (1개)
  { name: '대전외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '대전', website: 'https://djfl.dje.go.kr' },
  // 울산 (1개)
  { name: '울산외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '울산', website: 'https://usfl.use.go.kr' },
  // 세종 (1개)
  { name: '세종외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '세종', website: 'https://sjfl.sje.go.kr' },
  // 강원 (1개)
  { name: '강원외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '강원', website: 'https://kwfl.gwe.go.kr' },
  // 충북 (1개)
  { name: '충북외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '충북', website: 'https://cbfl.cbe.go.kr' },
  // 충남 (1개)
  { name: '충남외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '충남', website: 'https://cnfl.cne.go.kr' },
  // 경북 (1개)
  { name: '경북외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경북', website: 'https://kbfl.gbe.go.kr' },
  // 경남 (1개)
  { name: '김해외국어고등학교', type: SchoolType.FOREIGN_LANGUAGE, region: '경남', website: 'https://ghfl.gne.go.kr' },

  // ==================== 국제고 (8개) ====================
  { name: '서울국제고등학교', type: SchoolType.INTERNATIONAL, region: '서울', website: 'https://sihs.sen.hs.kr' },
  { name: '세종국제고등학교', type: SchoolType.INTERNATIONAL, region: '세종', website: 'https://sjig.sje.go.kr' },
  { name: '인천국제고등학교', type: SchoolType.INTERNATIONAL, region: '인천', website: 'https://icig.icems.kr' },
  { name: '고양국제고등학교', type: SchoolType.INTERNATIONAL, region: '경기', website: 'https://gyig.goe.go.kr' },
  { name: '동탄국제고등학교', type: SchoolType.INTERNATIONAL, region: '경기', website: 'https://dtig.goe.go.kr' },
  { name: '청심국제고등학교', type: SchoolType.INTERNATIONAL, region: '경기', website: 'https://csig.hs.kr' },
  { name: '부산국제고등학교', type: SchoolType.INTERNATIONAL, region: '부산', website: 'https://bsig.pen.hs.kr' },
  { name: '대전국제고등학교', type: SchoolType.INTERNATIONAL, region: '대전', website: 'https://djig.dje.go.kr' },

  // ==================== 예술고 (28개) ====================
  // 서울 (9개)
  { name: '서울예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://sart.sen.hs.kr' },
  { name: '선화예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://sunhwa.sen.hs.kr' },
  { name: '덕원예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://dwart.sen.hs.kr' },
  { name: '국립국악고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://gugak.sen.hs.kr' },
  { name: '국립전통예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://nkart.sen.hs.kr' },
  { name: '서울공연예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://sopa.sen.hs.kr' },
  { name: '한국예술종합학교부설예술고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://knuahs.kr' },
  { name: '서울미디어고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://smedia.sen.hs.kr' },
  { name: '서울디자인고등학교', type: SchoolType.ARTS, region: '서울', website: 'https://sdh.sen.hs.kr' },
  // 경기 (6개)
  { name: '계원예술고등학교', type: SchoolType.ARTS, region: '경기', website: 'https://kaywon.hs.kr' },
  { name: '안양예술고등학교', type: SchoolType.ARTS, region: '경기', website: 'https://ayart.hs.kr' },
  { name: '고양예술고등학교', type: SchoolType.ARTS, region: '경기', website: 'https://gyart.hs.kr' },
  { name: '경기예술고등학교', type: SchoolType.ARTS, region: '경기', website: 'https://gart.hs.kr' },
  { name: '한국애니메이션고등학교', type: SchoolType.ARTS, region: '경기', website: 'https://kani.hs.kr' },
  { name: '전주공연예술고등학교', type: SchoolType.ARTS, region: '전북', website: 'https://jjpa.hs.kr' },
  // 부산 (2개)
  { name: '부산예술고등학교', type: SchoolType.ARTS, region: '부산', website: 'https://bsart.pen.hs.kr' },
  { name: '부산디자인고등학교', type: SchoolType.ARTS, region: '부산', website: 'https://bsdh.pen.hs.kr' },
  // 대구 (2개)
  { name: '대구예술고등학교', type: SchoolType.ARTS, region: '대구', website: 'https://dgart.dge.hs.kr' },
  { name: '계성예술고등학교', type: SchoolType.ARTS, region: '대구', website: 'https://ksart.dge.hs.kr' },
  // 인천 (1개)
  { name: '인천예술고등학교', type: SchoolType.ARTS, region: '인천', website: 'https://icart.icems.kr' },
  // 광주 (1개)
  { name: '광주예술고등학교', type: SchoolType.ARTS, region: '광주', website: 'https://gjart.gen.hs.kr' },
  // 대전 (1개)
  { name: '대전예술고등학교', type: SchoolType.ARTS, region: '대전', website: 'https://djart.dje.go.kr' },
  // 강원 (1개)
  { name: '강원예술고등학교', type: SchoolType.ARTS, region: '강원', website: 'https://kwart.gwe.go.kr' },
  // 충북 (1개)
  { name: '충북예술고등학교', type: SchoolType.ARTS, region: '충북', website: 'https://cbart.cbe.go.kr' },
  // 전북 (1개)
  { name: '전주예술고등학교', type: SchoolType.ARTS, region: '전북', website: 'https://jjart.jbe.go.kr' },
  // 전남 (1개)
  { name: '전남예술고등학교', type: SchoolType.ARTS, region: '전남', website: 'https://jnart.jne.go.kr' },
  // 경남 (1개)
  { name: '경남예술고등학교', type: SchoolType.ARTS, region: '경남', website: 'https://gnart.gne.go.kr' },

  // ==================== 체육고 (15개) ====================
  { name: '서울체육고등학교', type: SchoolType.SPORTS, region: '서울', website: 'https://ssph.sen.hs.kr' },
  { name: '경기체육고등학교', type: SchoolType.SPORTS, region: '경기', website: 'https://gsph.goe.go.kr' },
  { name: '인천체육고등학교', type: SchoolType.SPORTS, region: '인천', website: 'https://icsph.icems.kr' },
  { name: '부산체육고등학교', type: SchoolType.SPORTS, region: '부산', website: 'https://bsph.pen.hs.kr' },
  { name: '대구체육고등학교', type: SchoolType.SPORTS, region: '대구', website: 'https://dgph.dge.hs.kr' },
  { name: '광주체육고등학교', type: SchoolType.SPORTS, region: '광주', website: 'https://gjph.gen.hs.kr' },
  { name: '대전체육고등학교', type: SchoolType.SPORTS, region: '대전', website: 'https://djph.dje.go.kr' },
  { name: '울산체육고등학교', type: SchoolType.SPORTS, region: '울산', website: 'https://usph.use.go.kr' },
  { name: '강원체육고등학교', type: SchoolType.SPORTS, region: '강원', website: 'https://kwph.gwe.go.kr' },
  { name: '충북체육고등학교', type: SchoolType.SPORTS, region: '충북', website: 'https://cbph.cbe.go.kr' },
  { name: '충남체육고등학교', type: SchoolType.SPORTS, region: '충남', website: 'https://cnph.cne.go.kr' },
  { name: '전북체육고등학교', type: SchoolType.SPORTS, region: '전북', website: 'https://jbph.jbe.go.kr' },
  { name: '전남체육고등학교', type: SchoolType.SPORTS, region: '전남', website: 'https://jnph.jne.go.kr' },
  { name: '경북체육고등학교', type: SchoolType.SPORTS, region: '경북', website: 'https://kbph.gbe.go.kr' },
  { name: '경남체육고등학교', type: SchoolType.SPORTS, region: '경남', website: 'https://gnph.gne.go.kr' },

  // ==================== 자율형 사립고 (약 40개) ====================
  // 서울 (24개)
  { name: '하나고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://hana.sen.hs.kr' },
  { name: '배재고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://paejae.sen.hs.kr' },
  { name: '휘문고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://whimoon.sen.hs.kr' },
  { name: '중앙고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://chungang.sen.hs.kr' },
  { name: '중동고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://joongdong.sen.hs.kr' },
  { name: '경희고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://kyunghee.sen.hs.kr' },
  { name: '세화고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://sehwa.sen.hs.kr' },
  { name: '세화여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://sehwag.sen.hs.kr' },
  { name: '이화여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://ewha.sen.hs.kr' },
  { name: '숙명여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://sookmyung.sen.hs.kr' },
  { name: '한국외국어대학교부속고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://hafs.hs.kr' },
  { name: '한양대학교사범대학부속고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://hanyang.sen.hs.kr' },
  { name: '대광고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://daekwang.sen.hs.kr' },
  { name: '양정고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://yangjeong.sen.hs.kr' },
  { name: '보성고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://bosung.sen.hs.kr' },
  { name: '동성고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://dongsung.sen.hs.kr' },
  { name: '신일고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://shinil.sen.hs.kr' },
  { name: '장훈고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://janghoon.sen.hs.kr' },
  { name: '우신고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://wooshin.sen.hs.kr' },
  { name: '선덕고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://sundeok.sen.hs.kr' },
  { name: '현대고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://hyundai.sen.hs.kr' },
  { name: '영훈고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://younghoon.sen.hs.kr' },
  { name: '중산고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://jungsan.sen.hs.kr' },
  { name: '이대부속고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '서울', website: 'https://ewhahs.sen.hs.kr' },
  // 경기 (4개)
  { name: '용인한국외국어대학교부설고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경기', website: 'https://yihafs.hs.kr' },
  { name: '안산동산고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경기', website: 'https://asdongsan.hs.kr' },
  { name: '동화고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경기', website: 'https://donghwa.hs.kr' },
  { name: '송원고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경기', website: 'https://songwon.hs.kr' },
  // 인천 (2개)
  { name: '인천하늘고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '인천', website: 'https://icsky.icems.kr' },
  { name: '인천포스코고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '인천', website: 'https://icposco.icems.kr' },
  // 부산 (3개)
  { name: '해운대고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '부산', website: 'https://haeundae.pen.hs.kr' },
  { name: '부산해운대여자고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '부산', website: 'https://haeg.pen.hs.kr' },
  { name: '부일외국어고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '부산', website: 'https://buil.pen.hs.kr' },
  // 대구 (1개)
  { name: '대구계성고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '대구', website: 'https://kyesung.dge.hs.kr' },
  // 강원 (1개)
  { name: '민족사관고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '강원', website: 'https://minjok.hs.kr' },
  // 충남 (2개)
  { name: '북일고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '충남', website: 'https://bukil.hs.kr' },
  { name: '공주한일고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '충남', website: 'https://gjhanil.hs.kr' },
  // 전북 (1개)
  { name: '상산고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '전북', website: 'https://sangsan.hs.kr' },
  // 전남 (1개)
  { name: '광양제철고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '전남', website: 'https://gyjc.hs.kr' },
  // 경북 (2개)
  { name: '포항제철고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경북', website: 'https://phjc.hs.kr' },
  { name: '김천고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '경북', website: 'https://gimcheon.hs.kr' },
  // 울산 (1개)
  { name: '현대청운고등학교', type: SchoolType.AUTONOMOUS_PRIVATE, region: '울산', website: 'https://hdcu.hs.kr' },
];

async function seedAllSpecialSchools() {
  console.log('🏫 전국 특목고/자사고 완전 데이터 시드 시작...\n');

  let created = 0;
  let updated = 0;

  for (const school of allSpecialSchools) {
    try {
      const result = await prisma.school.upsert({
        where: {
          name_region: {
            name: school.name,
            region: school.region,
          },
        },
        update: {
          type: school.type,
          website: school.website,
          publishStatus: PublishStatus.PUBLISHED,
        },
        create: {
          name: school.name,
          type: school.type,
          region: school.region,
          website: school.website,
          publishStatus: PublishStatus.PUBLISHED,
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    } catch (error: any) {
      console.log(`   ❌ 오류: ${school.name} - ${error.message}`);
    }
  }

  console.log(`✅ 특목고/자사고 시드 완료!`);
  console.log(`   생성: ${created}개`);
  console.log(`   업데이트: ${updated}개`);
  console.log(`   총 입력: ${allSpecialSchools.length}개`);

  // 통계
  const byType = await prisma.school.groupBy({
    by: ['type'],
    _count: { id: true },
  });

  console.log('\n📊 유형별 현황:');
  byType.forEach(t => console.log(`   ${t.type}: ${t._count.id}개`));

  const total = await prisma.school.count();
  console.log(`\n   총 특목/자사고: ${total}개`);

  await prisma.$disconnect();
}

seedAllSpecialSchools().catch(console.error);

