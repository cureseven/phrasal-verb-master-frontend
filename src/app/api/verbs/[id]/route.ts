import { VerbsService } from '@/server/services/verbsService';
import { apiError, handle, json } from '@/server/http';
import { parseLocale } from '@/i18n/config';

const verbsService = new VerbsService();

export const GET = handle<{ id: string }>(async (req, { params }) => {
  const { id } = await params;
  try {
    const verb = await verbsService.getById(id, parseLocale(req.nextUrl.searchParams.get('lang')));
    if (!verb) {
      return apiError(404, '句動詞が見つかりません。', 'NOT_FOUND');
    }
    return json(verb);
  } catch (error) {
    console.error('getVerbById failed:', error);
    return apiError(500, '句動詞の取得に失敗しました。', 'SERVER_ERROR');
  }
});
