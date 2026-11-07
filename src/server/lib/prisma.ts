import { attachDatabasePool } from '@vercel/functions';
import { createPrismaClient } from './prismaClient';
import type { PrismaClient } from '@/generated/prisma/client';

// 開発時のホットリロードでクライアント（とDB接続）が増え続けないよう、globalThisに保持する。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return createPrismaClient(process.env.DATABASE_URL, { onPool: attachDatabasePool });
}

// 遅延初期化: `next build` のようにDATABASE_URLが無い環境でimportされても例外にしない
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = (globalForPrisma.prisma ??= createClient());
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
