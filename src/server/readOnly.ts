import type { NextRequest } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import { AdminService } from '@/server/services/adminService';
import { apiError, noContent } from '@/server/http';
import { requireAdmin } from '@/server/auth';

const adminService = new AdminService();

/** 管理者がユーザーを読み取り専用にする／解除する（restrict / unrestrict 共通） */
export async function updateReadOnly(
  req: NextRequest,
  params: Promise<{ id: string }>,
  isReadOnly: boolean
): Promise<Response> {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiError(404, 'ユーザーが見つかりません。');
    }
    await adminService.setReadOnly(id, isReadOnly);
    return noContent();
  } catch (error) {
    console.error('updateReadOnly failed:', error);
    return apiError(500, '更新に失敗しました。');
  }
}
