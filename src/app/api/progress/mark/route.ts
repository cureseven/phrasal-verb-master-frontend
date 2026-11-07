import { ProgressError, ProgressService } from '@/server/services/progressService';
import { apiError, handle, json, readJson } from '@/server/http';
import { checkWritable, requireUser } from '@/server/auth';

const progressService = new ProgressService();

export const POST = handle(async (req) => {
  const userId = requireUser(req);
  if (typeof userId !== 'string') return userId;
  const notWritable = await checkWritable(userId);
  if (notWritable) return notWritable;

  const { phrasalVerbId, status } = await readJson(req);
  if (typeof phrasalVerbId !== 'string' || typeof status !== 'string') {
    return apiError(400, 'phrasalVerbIdとstatusは必須です。', 'BAD_REQUEST');
  }

  try {
    const result = await progressService.mark(userId, phrasalVerbId, status);
    return json(result);
  } catch (error) {
    if (error instanceof ProgressError) {
      return apiError(error.status, error.message, error.code);
    }
    console.error('markProgress failed:', error);
    return apiError(500, '進捗の更新に失敗しました。', 'SERVER_ERROR');
  }
});
