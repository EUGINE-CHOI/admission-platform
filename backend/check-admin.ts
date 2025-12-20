import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 관리자 계정 확인
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
    select: { id: true, email: true, role: true, password: true }
  });

  if (admin) {
    console.log('✅ 관리자 계정 존재:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    
    // 비밀번호 확인
    const isValid = await bcrypt.compare('Test1234!', admin.password);
    console.log(`   비밀번호 'Test1234!' 일치: ${isValid}`);
  } else {
    console.log('❌ admin@test.com 계정이 없습니다.');
    console.log('새 관리자 계정을 생성합니다...');
    
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: '관리자',
        role: 'ADMIN',
      }
    });
    console.log('✅ 관리자 계정 생성 완료:', newAdmin.email);
  }

  await prisma.$disconnect();
}

main();







