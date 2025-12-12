/**
 * 중학교 동아리 크롤링 확장
 * 여러 중학교의 동아리 정보를 수집합니다.
 */

import { ClubCrawlerService, ClubCrawlResult } from './src/crawler/services/club-crawler.service';
import { PrismaClient } from './generated/prisma';
import * as fs from 'fs';

const prisma = new PrismaClient();

// 크롤링할 서울/경기 중학교 목록
const schoolsToCrawl = [
  // 서울 강남/서초
  { name: '서초중학교', url: 'https://seocho.sen.ms.kr' },
  { name: '반포중학교', url: 'https://banpo.sen.ms.kr' },
  { name: '서문여자중학교', url: 'https://seomoon.sen.ms.kr' },
  { name: '언주중학교', url: 'https://eonju.sen.ms.kr' },
  { name: '대명중학교', url: 'https://dm.sen.ms.kr' },
  // 서울 송파/강동
  { name: '잠실중학교', url: 'https://jamsil.sen.ms.kr' },
  { name: '가락중학교', url: 'https://garak.sen.ms.kr' },
  { name: '문정중학교', url: 'https://munjeong.sen.ms.kr' },
  { name: '오금중학교', url: 'https://ogeum.sen.ms.kr' },
  // 서울 강북/성북
  { name: '경복중학교', url: 'https://kyungbok.sen.ms.kr' },
  { name: '성북중학교', url: 'https://seongbuk.sen.ms.kr' },
  // 경기 성남/분당
  { name: '분당중학교', url: 'https://bundang.goe.ms.kr' },
  { name: '수내중학교', url: 'https://sunae.goe.ms.kr' },
  { name: '내정중학교', url: 'https://naejeong.goe.ms.kr' },
  // 경기 용인
  { name: '수지중학교', url: 'https://suji.goe.ms.kr' },
];

const mockPrismaService = {
  middleSchool: prisma.middleSchool,
};

async function crawlMoreClubs() {
  console.log('🏫 중학교 동아리 크롤링 확장 시작...\n');
  console.log(`📋 대상 학교: ${schoolsToCrawl.length}개\n`);

  const crawler = new ClubCrawlerService(mockPrismaService as any);
  const allResults: ClubCrawlResult[] = [];
  const allClubs: any[] = [];

  for (let i = 0; i < schoolsToCrawl.length; i++) {
    const school = schoolsToCrawl[i];
    console.log(`[${i + 1}/${schoolsToCrawl.length}] 📍 ${school.name} 크롤링 중...`);

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
    if (i < schoolsToCrawl.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  await crawler.closeBrowser();

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 크롤링 결과 요약');
  console.log('='.repeat(60));
  
  const successCount = allResults.filter(r => r.success).length;
  const clubsFoundCount = allResults.filter(r => r.clubsFound > 0).length;
  
  console.log(`총 학교: ${schoolsToCrawl.length}개`);
  console.log(`접속 성공: ${successCount}개`);
  console.log(`동아리 발견: ${clubsFoundCount}개 학교`);
  console.log(`총 동아리: ${allClubs.length}개`);

  // 카테고리별 통계
  const categoryStats: Record<string, number> = {};
  for (const club of allClubs) {
    const cat = club.category || '기타';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  }

  console.log('\n📋 카테고리별 동아리:');
  for (const [cat, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}개`);
  }

  // 결과 저장
  if (allClubs.length > 0) {
    const outputPath = 'data/crawled_clubs.json';
    fs.writeFileSync(outputPath, JSON.stringify(allClubs, null, 2), 'utf-8');
    console.log(`\n💾 결과 저장: ${outputPath}`);

    console.log('\n📋 발견된 동아리 목록:');
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

crawlMoreClubs().catch(console.error);

