import { VerbsService } from '@/server/services/verbsService';
import { apiError, handle, json } from '@/server/http';
import { getUserId } from '@/server/auth';
import { parseLocale } from '@/i18n/config';

const verbsService = new VerbsService();

export const GET = handle(async (req) => {
  const params = req.nextUrl.searchParams;
  try {
    const verbs = await verbsService.list({
      verb: params.get('verb') ?? undefined,
      particle: params.get('particle') ?? undefined,
      status: params.get('status') ?? undefined,
      userId: getUserId(req) ?? undefined,
      locale: parseLocale(params.get('lang')),
    });
    return json(verbs);
  } catch (error) {
    console.error('listVerbs failed:', error);
    return apiError(500, '句動詞一覧の取得に失敗しました。', 'SERVER_ERROR');
  }
});
