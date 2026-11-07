import { ProgressService } from '@/server/services/progressService';
import { apiError, handle, json } from '@/server/http';
import { requireUser } from '@/server/auth';

const progressService = new ProgressService();

export const GET = handle(async (req) => {
  const userId = requireUser(req);
  if (typeof userId !== 'string') return userId;

  try {
    return json(await progressService.summary(userId));
  } catch (error) {
    console.error('getProgressSummary failed:', error);
    return apiError(500, '進捗サマリーの取得に失敗しました。', 'SERVER_ERROR');
  }
});
