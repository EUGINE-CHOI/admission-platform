import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'student@test.com';
  const password = 'password123';
  
  // 기존 계정 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Demo account already exists:', existingUser.email);
    
    // 비밀번호 업데이트
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('Password updated successfully!');
  } else {
    // 새 계정 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: '체험 학생',
        role: 'STUDENT',
        grade: 2,
      },
    });
    console.log('Demo account created:', user.email);
  }

  console.log('\nDemo account info:');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


