import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // 모든 성적 조회
  const grades = await prisma.grade.findMany({
    take: 20,
    include: {
      student: {
        select: { email: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('=== 최근 성적 데이터 ===');
  console.log('Total grades:', grades.length);
  grades.forEach(g => {
    console.log(`- ${g.student?.email}: ${g.subject} ${g.year}/${g.semester}학기 - 1회고사:${g.written1}, 2회고사:${g.written2}, 수행:${g.performance}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

