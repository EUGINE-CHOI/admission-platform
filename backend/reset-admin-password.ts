import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  
  const admin = await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { password: hashedPassword }
  });
  
  console.log('✅ 비밀번호 재설정 완료!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   새 비밀번호: Test1234!`);

  await prisma.$disconnect();
}

main();


