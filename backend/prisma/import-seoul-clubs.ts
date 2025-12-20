/**
 * 서울 열린데이터광장 동아리 데이터 Import 스크립트
 * 
 * 사용법:
 * 1. data.seoul.go.kr에서 "서울시 학교별 동아리 활동 현황" 다운로드
 * 2. CSV 파일을 backend/data/seoul_clubs.csv로 저장
 * 3. npx ts-node prisma/import-seoul-clubs.ts 실행
 */

import { PrismaClient } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ClubRecord {
  schoolName: string;
  clubName: string;
  year: string;
  grade?: string;
  memberCount?: number;
  category?: string;
}

// 동아리 카테고리 자동 분류
function detectCategory(clubName: string): string {
  const categories: Record<string, string[]> = {
    '학술': ['과학', '수학', '영어', '토론', '독서', '역사', '경제', '프로그래밍', '코딩', '탐구', '발명', '논술'],
    '예술': ['미술', '음악', '합창', '밴드', '오케스트라', '연극', '댄스', '무용', '사진', '영상', '방송', '그림'],
    '체육': ['축구', '농구', '배구', '야구', '태권도', '수영', '배드민턴', '탁구', '육상', '체조', '검도'],
    '봉사': ['봉사', '환경', 'RCY', '적십자', '또래상담', '멘토링', '자원'],
    '진로': ['진로', '직업', '창업', '리더십', '학생회'],
    '문화': ['문화', '전통', '국악', '요리', '애니메이션', '만화', '게임', '한국'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => clubName.includes(kw))) {
      return category;
    }
  }
  return '기타';
}

// CSV 파싱 (간단한 버전)
function parseCSV(content: string): ClubRecord[] {
  const lines = content.split('\n');
  const records: ClubRecord[] = [];
  
  // 헤더 스킵 (첫 줄)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV 파싱 (쉼표로 분리, 큰따옴표 처리)
    const cols = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
    
    // 서울시 데이터 컬럼 구조 (예상):
    // 시도교육청명, 학교명, 학년도, 주야과정명, 계열명, 학과명, 학년, 반명, 동아리명, 동아리인원수, 적재일시
    if (cols.length >= 9) {
      const schoolName = cols[1]; // 학교명
      const year = cols[2];       // 학년도
      const grade = cols[6];      // 학년
      const clubName = cols[8];   // 동아리명
      const memberCount = parseInt(cols[9]) || 0; // 동아리인원수
      
      if (schoolName && clubName && schoolName.includes('중학교')) {
        records.push({
          schoolName,
          clubName,
          year,
          grade,
          memberCount,
          category: detectCategory(clubName),
        });
      }
    }
  }
  
  return records;
}

async function importClubs() {
  const csvPath = path.join(__dirname, '../data/seoul_clubs.csv');
  
  // 파일 존재 확인
  if (!fs.existsSync(csvPath)) {
    console.log('❌ 파일을 찾을 수 없습니다: backend/data/seoul_clubs.csv');
    console.log('\n📝 다음 단계를 따라주세요:');
    console.log('1. https://data.seoul.go.kr 접속');
    console.log('2. "학교별 동아리" 검색');
    console.log('3. CSV 파일 다운로드');
    console.log('4. backend/data/seoul_clubs.csv로 저장');
    console.log('5. 이 스크립트 다시 실행');
    return;
  }
  
  console.log('📂 CSV 파일 읽는 중...');
  const content = fs.readFileSync(csvPath, 'utf-8');
  
  console.log('🔄 데이터 파싱 중...');
  const records = parseCSV(content);
  
  console.log(`📊 총 ${records.length}개 동아리 레코드 발견`);
  
  // 중복 제거 (학교명 + 동아리명 기준)
  const uniqueClubs = new Map<string, ClubRecord>();
  for (const record of records) {
    const key = `${record.schoolName}_${record.clubName}`;
    if (!uniqueClubs.has(key) || (record.memberCount || 0) > (uniqueClubs.get(key)?.memberCount || 0)) {
      uniqueClubs.set(key, record);
    }
  }
  
  console.log(`🔍 중복 제거 후 ${uniqueClubs.size}개 고유 동아리`);
  
  // 학교별 통계
  const schoolStats = new Map<string, number>();
  for (const club of uniqueClubs.values()) {
    schoolStats.set(club.schoolName, (schoolStats.get(club.schoolName) || 0) + 1);
  }
  
  console.log(`\n🏫 학교별 동아리 수 (상위 10개):`);
  const sortedSchools = [...schoolStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [school, count] of sortedSchools) {
    console.log(`   ${school}: ${count}개`);
  }
  
  // 카테고리별 통계
  const categoryStats = new Map<string, number>();
  for (const club of uniqueClubs.values()) {
    categoryStats.set(club.category!, (categoryStats.get(club.category!) || 0) + 1);
  }
  
  console.log(`\n📋 카테고리별 동아리 수:`);
  for (const [category, count] of categoryStats.entries()) {
    console.log(`   ${category}: ${count}개`);
  }
  
  // DB에 저장 (Club 테이블이 있다면)
  // 현재는 통계만 출력
  console.log('\n✅ 데이터 분석 완료!');
  console.log('💡 Club 테이블 생성 후 DB에 저장할 수 있습니다.');
  
  await prisma.$disconnect();
}

importClubs().catch(console.error);







