import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@perizia.com';
  const adminPassword = 'password123';
  
  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
  });

  const admin = await prisma.staff.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: true,
    }
  });
  console.log('Created Admin:', admin.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
