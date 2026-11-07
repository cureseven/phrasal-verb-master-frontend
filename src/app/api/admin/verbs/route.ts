import { VerbsService } from '@/server/services/verbsService';
import { apiError, handle, json, readJson } from '@/server/http';
import { requireAdmin } from '@/server/auth';
import {
  EXAMPLES_REQUIRED_MESSAGE,
  MEANINGS_REQUIRED_MESSAGE,
  parseExamples,
  parseLocalizedText,
} from '@/server/validation';

const verbsService = new VerbsService();

export const POST = handle(async (req) => {
  const adminId = await requireAdmin(req);
  if (typeof adminId !== 'string') return adminId;

  const { verb, particle, meanings, examples } = await readJson(req);

  for (const [key, value] of Object.entries({ verb, particle })) {
    if (typeof value !== 'string' || !value.trim()) {
      return apiError(400, `${key}は必須です。`);
    }
  }
  const parsedMeanings = parseLocalizedText(meanings);
  if (!parsedMeanings) {
    return apiError(400, MEANINGS_REQUIRED_MESSAGE);
  }
  const parsedExamples = parseExamples(examples);
  if (!parsedExamples) {
    return apiError(400, EXAMPLES_REQUIRED_MESSAGE);
  }

  try {
    const created = await verbsService.create({
      verb: verb as string,
      particle: particle as string,
      meanings: parsedMeanings,
      examples: parsedExamples,
    });
    return json(created, 201);
  } catch (error) {
    console.error('createVerb failed:', error);
    return apiError(500, '句動詞の登録に失敗しました。');
  }
});
