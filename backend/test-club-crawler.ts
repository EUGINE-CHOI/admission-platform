import { ClubCrawlerService, ClubCrawlResult } from './src/crawler/services/club-crawler.service';
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

// 간단한 mock PrismaService
const mockPrismaService = {
  middleSchool: prisma.middleSchool,
};

async function testClubCrawler() {
  console.log('🏫 중학교 동아리 크롤링 테스트 시작...\n');

  const crawler = new ClubCrawlerService(mockPrismaService as any);

  // 샘플 학교 테스트
  const sampleSchools = [
    { name: '압구정중학교', url: 'https://apgujeong.sen.ms.kr' },
    { name: '역삼중학교', url: 'https://yeoksam.sen.ms.kr' },
    { name: '서초중학교', url: 'https://seocho.sen.ms.kr' },
  ];

  const results: ClubCrawlResult[] = [];

  for (const school of sampleSchools) {
    console.log(`\n📍 크롤링 중: ${school.name} (${school.url})`);
    console.log('   ⏳ 페이지 로딩 중...');
    
    try {
      const result = await crawler.crawlClubsFromUrl(school.name, school.url);
      results.push(result);
      
      if (result.success) {
        console.log(`   ✅ 성공! ${result.clubsFound}개 동아리 발견`);
        if (result.clubs.length > 0) {
          console.log('   📋 발견된 동아리:');
          result.clubs.slice(0, 5).forEach((club, i) => {
            console.log(`      ${i + 1}. ${club.clubName} (${club.category || '미분류'})`);
          });
          if (result.clubs.length > 5) {
            console.log(`      ... 외 ${result.clubs.length - 5}개`);
          }
        }
      } else {
        console.log(`   ❌ 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`   ❌ 오류: ${error.message}`);
    }

    // 서버 부하 방지
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await crawler.closeBrowser();

  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 크롤링 결과 요약');
  console.log('='.repeat(50));
  console.log(`총 학교: ${results.length}`);
  console.log(`성공: ${results.filter(r => r.success).length}`);
  console.log(`발견된 동아리: ${results.reduce((sum, r) => sum + r.clubsFound, 0)}`);
  
  // 전체 동아리 목록
  const allClubs = results.flatMap(r => r.clubs);
  if (allClubs.length > 0) {
    console.log('\n📋 발견된 전체 동아리:');
    allClubs.forEach((club, i) => {
      console.log(`   ${i + 1}. [${club.schoolName}] ${club.clubName} (${club.category || '미분류'})`);
    });
  }

  await prisma.$disconnect();
}

testClubCrawler().catch(console.error);

