import type { Locale } from '../config';
import { ja, type Dictionary } from './ja';
import { zh } from './zh';

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ja, zh };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
