import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function check() {
  const byType = await prisma.school.groupBy({
    by: ['type'],
    _count: { id: true }
  });
  
  const byRegion = await prisma.school.groupBy({
    by: ['region'],
    _count: { id: true }
  });
  
  console.log('📊 학교 유형별 현황:');
  byType.forEach(t => console.log(`   ${t.type}: ${t._count.id}개`));
  
  console.log('\n📍 지역별 현황:');
  byRegion.sort((a, b) => b._count.id - a._count.id).forEach(r => console.log(`   ${r.region}: ${r._count.id}개`));
  
  const total = await prisma.school.count();
  console.log(`\n   총 특목/자사고: ${total}개`);
  
  // 유형별 상세
  console.log('\n📋 유형별 학교 목록:');
  const types = ['SCIENCE', 'FOREIGN_LANGUAGE', 'INTERNATIONAL', 'ARTS', 'SPORTS', 'AUTONOMOUS_PRIVATE'];
  for (const type of types) {
    const schools = await prisma.school.findMany({
      where: { type: type as any },
      select: { name: true, region: true },
      orderBy: { region: 'asc' }
    });
    console.log(`\n   [${type}] ${schools.length}개:`);
    schools.forEach(s => console.log(`      - ${s.name} (${s.region})`));
  }
  
  await prisma.$disconnect();
}

check();

