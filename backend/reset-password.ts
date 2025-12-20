import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'kadee0726@naver.com';
  const newPassword = 'password123'; // 새 비밀번호

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found:', email);
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log('Password reset successfully!');
  console.log('Email:', email);
  console.log('New Password:', newPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

