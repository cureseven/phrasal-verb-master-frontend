import { prisma } from '@/server/lib/prisma';
import { json } from '@/server/http';

// DB接続確認用（keep-aliveの定期実行からも呼ばれる）
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('dbhealth failed:', error);
    return json({ status: 'error', message: 'Database connection failed' }, 500);
  }
}
