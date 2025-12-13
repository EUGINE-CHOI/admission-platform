/**
 * 인천 중학교 동아리 크롤링
 */

import { ClubCrawlerService, ClubCrawlResult } from './src/crawler/services/club-crawler.service';
import { PrismaClient } from './generated/prisma';
import * as fs from 'fs';

const prisma = new PrismaClient();

// 인천 중학교 목록 (실제 웹사이트 URL)
const incheonSchools = [
  // 남동구
  { name: '논현중학교', url: 'https://nonhyeon.icems.kr' },
  { name: '만수중학교', url: 'https://mansu.icems.kr' },
  { name: '구월중학교', url: 'https://guwol.icems.kr' },
  { name: '간석중학교', url: 'https://ganseok.icems.kr' },
  { name: '남동중학교', url: 'https://namdong.icems.kr' },
  // 연수구
  { name: '연수중학교', url: 'https://yeonsu.icems.kr' },
  { name: '선학중학교', url: 'https://sunhak.icems.kr' },
  { name: '연송중학교', url: 'https://yeonsong.icems.kr' },
  { name: '청량중학교', url: 'https://cheongryang.icems.kr' },
  // 부평구
  { name: '부평중학교', url: 'https://bupyeong.icems.kr' },
  { name: '부개중학교', url: 'https://bugae.icems.kr' },
  { name: '삼산중학교', url: 'https://samsan.icems.kr' },
  // 서구
  { name: '가좌중학교', url: 'https://gajwa.icems.kr' },
  { name: '검단중학교', url: 'https://geomdan.icems.kr' },
  // 계양구
  { name: '계양중학교', url: 'https://gyeyang.icems.kr' },
  { name: '효성중학교', url: 'https://hyosung.icems.kr' },
];

const mockPrismaService = {
  middleSchool: prisma.middleSchool,
};

async function crawlIncheonClubs() {
  console.log('🏫 인천 중학교 동아리 크롤링 시작...\n');
  console.log(`📋 대상 학교: ${incheonSchools.length}개\n`);

  const crawler = new ClubCrawlerService(mockPrismaService as any);
  const allResults: ClubCrawlResult[] = [];
  const allClubs: any[] = [];

  for (let i = 0; i < incheonSchools.length; i++) {
    const school = incheonSchools[i];
    console.log(`[${i + 1}/${incheonSchools.length}] 📍 ${school.name} 크롤링 중...`);

    try {
      const result = await crawler.crawlClubsFromUrl(school.name, school.url);
      allResults.push(result);

      if (result.success && result.clubsFound > 0) {
        console.log(`   ✅ 성공! ${result.clubsFound}개 동아리 발견`);
        allClubs.push(...result.clubs);
      } else if (result.success) {
        console.log(`   ⚠️ 동아리 정보를 찾지 못함`);
      } else {
        console.log(`   ❌ 실패: ${result.error?.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.log(`   ❌ 오류: ${error.message?.substring(0, 50)}...`);
    }

    // 서버 부하 방지 (3초 대기)
    if (i < incheonSchools.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  await crawler.closeBrowser();

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 인천 크롤링 결과 요약');
  console.log('='.repeat(60));
  
  const successCount = allResults.filter(r => r.success).length;
  const clubsFoundCount = allResults.filter(r => r.clubsFound > 0).length;
  
  console.log(`총 학교: ${incheonSchools.length}개`);
  console.log(`접속 성공: ${successCount}개`);
  console.log(`동아리 발견: ${clubsFoundCount}개 학교`);
  console.log(`총 동아리: ${allClubs.length}개`);

  // 기존 데이터와 병합
  const existingDataPath = 'data/crawled_clubs.json';
  let existingClubs: any[] = [];
  
  if (fs.existsSync(existingDataPath)) {
    existingClubs = JSON.parse(fs.readFileSync(existingDataPath, 'utf-8'));
  }

  const mergedClubs = [...existingClubs, ...allClubs];
  fs.writeFileSync(existingDataPath, JSON.stringify(mergedClubs, null, 2), 'utf-8');
  
  console.log(`\n💾 결과 저장: ${existingDataPath}`);
  console.log(`   기존: ${existingClubs.length}개 + 신규: ${allClubs.length}개 = 총 ${mergedClubs.length}개`);

  if (allClubs.length > 0) {
    console.log('\n📋 인천에서 발견된 동아리:');
    const clubsBySchool: Record<string, string[]> = {};
    for (const club of allClubs) {
      if (!clubsBySchool[club.schoolName]) {
        clubsBySchool[club.schoolName] = [];
      }
      clubsBySchool[club.schoolName].push(`${club.clubName} (${club.category || '기타'})`);
    }

    for (const [school, clubs] of Object.entries(clubsBySchool)) {
      console.log(`\n   🏫 ${school}:`);
      clubs.forEach(c => console.log(`      - ${c}`));
    }
  }

  await prisma.$disconnect();
}

crawlIncheonClubs().catch(console.error);


