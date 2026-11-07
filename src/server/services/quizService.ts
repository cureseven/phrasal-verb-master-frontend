import { Prisma } from '@/generated/prisma/client';
import { Locale } from '@/i18n/config';
import { PublicPhrasalVerb, toPublicVerb, VerbsService } from './verbsService';

const verbsService = new VerbsService();

export class QuizService {
  async getNextCard(locale: Locale, mode?: string, word?: string): Promise<PublicPhrasalVerb> {
    let whereClause: Prisma.PhrasalVerbWhereInput = {};

    if (mode && word) {
      if (mode === 'verb_fixed') {
        whereClause = { verb: word };
      } else if (mode === 'particle_fixed') {
        whereClause = { particle: word };
      }
    }

    let verbs = await verbsService.findForQuiz(whereClause);

    if (verbs.length === 0) {
      verbs = await verbsService.findForQuiz({});
    }

    if (verbs.length === 0) {
      throw new Error('No phrasal verbs found in database.');
    }

    const target = verbs[Math.floor(Math.random() * verbs.length)];
    return toPublicVerb(target, locale);
  }
}
