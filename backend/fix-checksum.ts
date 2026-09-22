import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const migrationsDir = path.join(__dirname, 'prisma/migrations');
  const migrationName = '20260908065705_step10_staff_auth';
  const migrationFile = path.join(migrationsDir, migrationName, 'migration.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.log('Migration file not found:', migrationFile);
    return;
  }
  
  const content = fs.readFileSync(migrationFile, 'utf8');
  const checksum = crypto.createHash('sha256').update(content).digest('hex');
  console.log('Calculated checksum:', checksum);
  
  const result = await prisma.$executeRawUnsafe(
    `UPDATE _prisma_migrations SET checksum = $1 WHERE migration_name = $2`,
    checksum,
    migrationName
  );
  
  console.log('Updated rows:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
