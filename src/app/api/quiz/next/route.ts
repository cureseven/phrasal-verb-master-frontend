import { QuizService } from '@/server/services/quizService';
import { apiError, handle, json } from '@/server/http';
import { parseLocale } from '@/i18n/config';

const quizService = new QuizService();

export const GET = handle(async (req) => {
  const params = req.nextUrl.searchParams;
  try {
    const result = await quizService.getNextCard(
      parseLocale(params.get('lang')),
      params.get('mode') ?? undefined,
      params.get('word') ?? undefined
    );
    return json(result);
  } catch (error) {
    console.error('getNextQuiz failed:', error);
    return apiError(500, '問題の取得に失敗しました。', 'SERVER_ERROR');
  }
});
