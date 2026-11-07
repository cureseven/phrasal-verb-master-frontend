import { VerbsService } from '@/server/services/verbsService';
import { apiError, handle, json } from '@/server/http';
import { parseLocale } from '@/i18n/config';

const verbsService = new VerbsService();

export const GET = handle(async (req) => {
  const params = req.nextUrl.searchParams;
  const type = params.get('type');
  const value = params.get('value');

  if ((type !== 'verb' && type !== 'particle') || !value) {
    return apiError(400, 'typeは"verb"か"particle"、valueは必須です。', 'BAD_REQUEST');
  }

  try {
    const verbs = await verbsService.getRelated(type, value, parseLocale(params.get('lang')));
    return json(verbs);
  } catch (error) {
    console.error('getRelatedVerbs failed:', error);
    return apiError(500, '関連する句動詞の取得に失敗しました。', 'SERVER_ERROR');
  }
});
