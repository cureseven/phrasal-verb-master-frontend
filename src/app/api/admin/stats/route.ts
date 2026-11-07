import { AdminService } from '@/server/services/adminService';
import { apiError, handle, json } from '@/server/http';
import { requireAdmin } from '@/server/auth';

const adminService = new AdminService();

export const GET = handle(async (req) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  try {
    return json(await adminService.getStats());
  } catch (error) {
    console.error('getStats failed:', error);
    return apiError(500, '統計情報の取得に失敗しました。');
  }
});
