import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.staff.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, name: true, isActive: true }
  });
  console.log(JSON.stringify(admins, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
