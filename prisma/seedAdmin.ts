import bcrypt from 'bcryptjs';
import '../src/server/lib/loadEnv';
import { createPrismaClient } from '../src/server/lib/prismaClient';

const prisma = createPrismaClient(process.env.DATABASE_URL);

const SALT_ROUNDS = 10;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL と ADMIN_PASSWORD を環境変数に設定してください。');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`管理者は既に存在します: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = await prisma.admin.create({ data: { email, passwordHash } });
  console.log(`管理者を作成しました: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
