import { prisma } from '@/server/lib/prisma';
import { apiError, clearAuthCookie, handle, json } from '@/server/http';
import { ADMIN_AUTH_COOKIE_NAME, requireAdmin } from '@/server/auth';

export const GET = handle(async (req) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true },
  });
  if (!admin) {
    return clearAuthCookie(apiError(401, '認証が必要です。'), ADMIN_AUTH_COOKIE_NAME);
  }
  return json({ admin });
});
