import { VerbsService } from '@/server/services/verbsService';
import { apiError, handle, json, noContent, readJson } from '@/server/http';
import { requireAdmin } from '@/server/auth';
import {
  EXAMPLES_REQUIRED_MESSAGE,
  MEANINGS_REQUIRED_MESSAGE,
  parseExamples,
  parseLocalizedText,
} from '@/server/validation';

const verbsService = new VerbsService();

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle<{ id: string }>(async (req, { params }: Ctx) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const { id } = await params;
  try {
    const verb = await verbsService.getByIdForAdmin(id);
    if (!verb) {
      return apiError(404, '句動詞が見つかりません。');
    }
    return json(verb);
  } catch (error) {
    console.error('getVerb failed:', error);
    return apiError(500, '句動詞の取得に失敗しました。');
  }
});

export const PATCH = handle<{ id: string }>(async (req, { params }: Ctx) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const { id } = await params;
  const { meanings, examples } = await readJson(req);

  const parsedMeanings = parseLocalizedText(meanings);
  if (!parsedMeanings) {
    return apiError(400, MEANINGS_REQUIRED_MESSAGE);
  }
  const parsedExamples = parseExamples(examples);
  if (!parsedExamples) {
    return apiError(400, EXAMPLES_REQUIRED_MESSAGE);
  }

  try {
    if (!(await verbsService.exists(id))) {
      return apiError(404, '句動詞が見つかりません。');
    }
    const updated = await verbsService.update(id, { meanings: parsedMeanings, examples: parsedExamples });
    return json(updated);
  } catch (error) {
    console.error('updateVerb failed:', error);
    return apiError(500, '更新に失敗しました。');
  }
});

export const DELETE = handle<{ id: string }>(async (req, { params }: Ctx) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const { id } = await params;
  try {
    if (!(await verbsService.exists(id))) {
      return apiError(404, '句動詞が見つかりません。');
    }
    await verbsService.delete(id);
    return noContent();
  } catch (error) {
    console.error('deleteVerb failed:', error);
    return apiError(500, '削除に失敗しました。');
  }
});
