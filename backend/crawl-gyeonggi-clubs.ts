/**
 * 경기 중학교 동아리 크롤링
 */

import { ClubCrawlerService, ClubCrawlResult } from './src/crawler/services/club-crawler.service';
import { PrismaClient } from './generated/prisma';
import * as fs from 'fs';

const prisma = new PrismaClient();

// 경기 중학교 목록 (실제 웹사이트 URL - goe.go.kr 도메인)
const gyeonggiSchools = [
  // 분당
  { name: '분당중학교', url: 'https://school.goe.go.kr/bundang' },
  { name: '수내중학교', url: 'https://school.goe.go.kr/sunae' },
  { name: '내정중학교', url: 'https://school.goe.go.kr/naejeong' },
  { name: '정자중학교', url: 'https://school.goe.go.kr/jeongja' },
  { name: '서현중학교', url: 'https://school.goe.go.kr/seohyeon' },
  { name: '이매중학교', url: 'https://school.goe.go.kr/imae' },
  { name: '판교중학교', url: 'https://school.goe.go.kr/pangyo' },
  // 용인
  { name: '수지중학교', url: 'https://school.goe.go.kr/suji' },
  { name: '손곡중학교', url: 'https://school.goe.go.kr/songok' },
  { name: '성복중학교', url: 'https://school.goe.go.kr/seongbok' },
  { name: '동백중학교', url: 'https://school.goe.go.kr/dongbaek' },
  // 수원
  { name: '영통중학교', url: 'https://school.goe.go.kr/yeongtong' },
  { name: '수원중학교', url: 'https://school.goe.go.kr/suwon' },
  { name: '청명중학교', url: 'https://school.goe.go.kr/cheongmyeong' },
  // 고양
  { name: '백석중학교', url: 'https://school.goe.go.kr/baekseok' },
  { name: '마두중학교', url: 'https://school.goe.go.kr/madu' },
  { name: '정발중학교', url: 'https://school.goe.go.kr/jeongbal' },
  // 안양
  { name: '평촌중학교', url: 'https://school.goe.go.kr/pyeongchon' },
  { name: '범계중학교', url: 'https://school.goe.go.kr/beomgye' },
  // 부천
  { name: '상동중학교', url: 'https://school.goe.go.kr/sangdong' },
  { name: '송내중학교', url: 'https://school.goe.go.kr/songnae' },
];

const mockPrismaService = {
  middleSchool: prisma.middleSchool,
};

async function crawlGyeonggiClubs() {
  console.log('🏫 경기 중학교 동아리 크롤링 시작...\n');
  console.log(`📋 대상 학교: ${gyeonggiSchools.length}개\n`);

  const crawler = new ClubCrawlerService(mockPrismaService as any);
  const allResults: ClubCrawlResult[] = [];
  const allClubs: any[] = [];

  for (let i = 0; i < gyeonggiSchools.length; i++) {
    const school = gyeonggiSchools[i];
    console.log(`[${i + 1}/${gyeonggiSchools.length}] 📍 ${school.name} 크롤링 중...`);

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
    if (i < gyeonggiSchools.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  await crawler.closeBrowser();

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 경기 크롤링 결과 요약');
  console.log('='.repeat(60));
  
  const successCount = allResults.filter(r => r.success).length;
  const clubsFoundCount = allResults.filter(r => r.clubsFound > 0).length;
  
  console.log(`총 학교: ${gyeonggiSchools.length}개`);
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

  await prisma.$disconnect();
}

crawlGyeonggiClubs().catch(console.error);







