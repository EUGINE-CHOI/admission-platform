import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const email = 'kadee0726@naver.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (user) {
    console.log('User found:');
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log('User not found:', email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

