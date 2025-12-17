/**
 * 동아리 데이터 시드 스크립트
 * 1. 일반 동아리 카테고리 (템플릿)
 * 2. 크롤링된 동아리 데이터
 */

import { PrismaClient, ClubCategory } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 일반 동아리 카테고리 템플릿
const generalClubs = [
  // 학술 동아리
  { name: '과학탐구반', category: ClubCategory.ACADEMIC, description: '과학 실험 및 탐구 활동' },
  { name: '수학경시반', category: ClubCategory.ACADEMIC, description: '수학 문제 풀이 및 경시대회 준비' },
  { name: '영어토론반', category: ClubCategory.ACADEMIC, description: '영어 토론 및 스피치 연습' },
  { name: '독서토론반', category: ClubCategory.ACADEMIC, description: '책 읽기 및 토론 활동' },
  { name: '역사탐구반', category: ClubCategory.ACADEMIC, description: '역사 연구 및 답사 활동' },
  { name: '코딩동아리', category: ClubCategory.ACADEMIC, description: '프로그래밍 및 SW 개발 학습' },
  { name: '발명반', category: ClubCategory.ACADEMIC, description: '창의적 발명품 제작 및 대회 참가' },
  { name: '논술반', category: ClubCategory.ACADEMIC, description: '글쓰기 및 논술 실력 향상' },
  { name: '영자신문반', category: ClubCategory.ACADEMIC, description: '영어 신문 제작 및 기사 작성' },
  { name: '경제동아리', category: ClubCategory.ACADEMIC, description: '경제 이해 및 모의투자 활동' },
  
  // 예술 동아리
  { name: '합창부', category: ClubCategory.ARTS, description: '합창 연습 및 공연 활동' },
  { name: '밴드부', category: ClubCategory.ARTS, description: '밴드 악기 연주 및 공연' },
  { name: '오케스트라', category: ClubCategory.ARTS, description: '클래식 악기 연주 및 합주' },
  { name: '미술반', category: ClubCategory.ARTS, description: '그림 그리기 및 미술 작품 제작' },
  { name: '연극반', category: ClubCategory.ARTS, description: '연극 공연 및 연기 연습' },
  { name: '댄스부', category: ClubCategory.ARTS, description: '다양한 장르의 춤 연습 및 공연' },
  { name: '사진반', category: ClubCategory.ARTS, description: '사진 촬영 기술 및 작품 활동' },
  { name: '영상제작반', category: ClubCategory.ARTS, description: '동영상 촬영 및 편집' },
  { name: '방송부', category: ClubCategory.ARTS, description: '교내 방송 진행 및 제작' },
  { name: '만화동아리', category: ClubCategory.ARTS, description: '만화 그리기 및 웹툰 제작' },
  
  // 체육 동아리
  { name: '축구부', category: ClubCategory.SPORTS, description: '축구 연습 및 시합' },
  { name: '농구부', category: ClubCategory.SPORTS, description: '농구 연습 및 시합' },
  { name: '배구부', category: ClubCategory.SPORTS, description: '배구 연습 및 시합' },
  { name: '야구부', category: ClubCategory.SPORTS, description: '야구 연습 및 시합' },
  { name: '태권도부', category: ClubCategory.SPORTS, description: '태권도 수련 및 품새' },
  { name: '수영부', category: ClubCategory.SPORTS, description: '수영 연습 및 대회 참가' },
  { name: '배드민턴부', category: ClubCategory.SPORTS, description: '배드민턴 연습 및 시합' },
  { name: '탁구부', category: ClubCategory.SPORTS, description: '탁구 연습 및 시합' },
  { name: '육상부', category: ClubCategory.SPORTS, description: '달리기 및 육상 종목 훈련' },
  { name: '검도부', category: ClubCategory.SPORTS, description: '검도 수련 및 대회 참가' },
  
  // 봉사 동아리
  { name: 'RCY', category: ClubCategory.SERVICE, description: '청소년 적십자 봉사 활동' },
  { name: '또래상담반', category: ClubCategory.SERVICE, description: '또래 친구 상담 및 지원' },
  { name: '환경봉사단', category: ClubCategory.SERVICE, description: '환경 보호 및 봉사 활동' },
  { name: '멘토링반', category: ClubCategory.SERVICE, description: '후배 학습 지도 및 멘토링' },
  { name: '지역사회봉사단', category: ClubCategory.SERVICE, description: '지역 복지시설 봉사 활동' },
  
  // 진로 동아리
  { name: '진로탐색반', category: ClubCategory.CAREER, description: '다양한 직업 탐색 및 체험' },
  { name: '리더십반', category: ClubCategory.CAREER, description: '리더십 훈련 및 학생회 활동' },
  { name: '창업동아리', category: ClubCategory.CAREER, description: '창업 아이디어 및 모의 창업' },
  { name: '의료탐구반', category: ClubCategory.CAREER, description: '의료 분야 탐색 및 체험' },
  { name: '법률동아리', category: ClubCategory.CAREER, description: '법률 지식 학습 및 모의재판' },
  
  // 문화 동아리
  { name: '국악반', category: ClubCategory.CULTURE, description: '전통 악기 연주 및 국악 공연' },
  { name: '다문화반', category: ClubCategory.CULTURE, description: '다양한 문화 이해 및 교류' },
  { name: '요리동아리', category: ClubCategory.CULTURE, description: '요리 실습 및 음식 문화 탐구' },
  { name: '한국문화반', category: ClubCategory.CULTURE, description: '한국 전통 문화 체험 및 계승' },
  { name: '애니메이션반', category: ClubCategory.CULTURE, description: '애니메이션 감상 및 제작' },
];

// 카테고리 매핑
function mapCategory(category: string): ClubCategory {
  const mapping: Record<string, ClubCategory> = {
    '학술': ClubCategory.ACADEMIC,
    '예술': ClubCategory.ARTS,
    '체육': ClubCategory.SPORTS,
    '봉사': ClubCategory.SERVICE,
    '진로': ClubCategory.CAREER,
    '문화': ClubCategory.CULTURE,
    '기타': ClubCategory.OTHER,
  };
  return mapping[category] || ClubCategory.OTHER;
}

async function seedClubs() {
  console.log('🏫 동아리 데이터 시드 시작...\n');

  // 1. 일반 동아리 카테고리 (템플릿) 저장
  console.log('📋 일반 동아리 카테고리 저장 중...');
  
  for (const club of generalClubs) {
    await prisma.club.upsert({
      where: { 
        id: `general-${club.name}` // 임시 ID 생성
      },
      update: {
        name: club.name,
        category: club.category,
        description: club.description,
        isGeneral: true,
      },
      create: {
        id: `general-${club.name.replace(/\s/g, '-')}`,
        name: club.name,
        category: club.category,
        description: club.description,
        isGeneral: true,
      },
    });
  }
  console.log(`   ✅ ${generalClubs.length}개 일반 동아리 템플릿 저장 완료\n`);

  // 2. 크롤링된 동아리 데이터 저장
  const crawledDataPath = path.join(__dirname, '../data/crawled_clubs.json');
  
  if (fs.existsSync(crawledDataPath)) {
    console.log('📂 크롤링된 동아리 데이터 로드 중...');
    const crawledClubs = JSON.parse(fs.readFileSync(crawledDataPath, 'utf-8'));
    
    let savedCount = 0;
    for (const club of crawledClubs) {
      // 해당 중학교 찾기
      const middleSchool = await prisma.middleSchool.findFirst({
        where: { name: { contains: club.schoolName.replace('중학교', '') } }
      });

      await prisma.club.create({
        data: {
          name: club.clubName,
          category: mapCategory(club.category || '기타'),
          description: club.description,
          middleSchoolId: middleSchool?.id,
          isGeneral: false,
        },
      });
      savedCount++;
    }
    console.log(`   ✅ ${savedCount}개 크롤링 동아리 저장 완료\n`);
  } else {
    console.log('   ⚠️ 크롤링된 데이터 파일이 없습니다.\n');
  }

  // 결과 요약
  const totalClubs = await prisma.club.count();
  const generalCount = await prisma.club.count({ where: { isGeneral: true } });
  const schoolClubCount = await prisma.club.count({ where: { isGeneral: false } });

  console.log('='.repeat(50));
  console.log('📊 동아리 데이터 요약');
  console.log('='.repeat(50));
  console.log(`총 동아리: ${totalClubs}개`);
  console.log(`일반 템플릿: ${generalCount}개`);
  console.log(`학교별 동아리: ${schoolClubCount}개`);

  // 카테고리별 통계
  const categories = await prisma.club.groupBy({
    by: ['category'],
    _count: { id: true },
  });
  
  console.log('\n📋 카테고리별:');
  for (const cat of categories) {
    console.log(`   ${cat.category}: ${cat._count.id}개`);
  }

  await prisma.$disconnect();
}

seedClubs().catch(console.error);




