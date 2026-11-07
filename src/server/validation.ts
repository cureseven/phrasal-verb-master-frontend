import { LOCALES } from '@/i18n/config';
import type { ErrorCode } from '@/server/lib/errorCode';
import type { ExampleInput, LocalizedText } from '@/server/services/verbsService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 30;
export const EXAMPLE_COUNT = 3;

export function validateCredentials(
  email: unknown,
  password: unknown
): { error: string; code: ErrorCode } | null {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return { error: 'メールアドレスの形式が正しくありません。', code: 'INVALID_EMAIL' };
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`,
      code: 'PASSWORD_TOO_SHORT',
    };
  }
  return null;
}

/** 管理者ログインは長さの下限を設けず、入力があるかだけを見る */
export function validateAdminCredentials(email: unknown, password: unknown): string | null {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return 'メールアドレスの形式が正しくありません。';
  }
  if (typeof password !== 'string' || password.length === 0) {
    return 'パスワードを入力してください。';
  }
  return null;
}

/** { ja: '...', zh: '...' } の形で、対応する全言語が空でない文字列になっているかを確認する */
export function parseLocalizedText(value: unknown): LocalizedText | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const result: Partial<LocalizedText> = {};
  for (const locale of LOCALES) {
    const text = record[locale];
    if (typeof text !== 'string' || !text.trim()) {
      return null;
    }
    result[locale] = text;
  }
  return result as LocalizedText;
}

export function parseExamples(examples: unknown): ExampleInput[] | null {
  if (!Array.isArray(examples) || examples.length !== EXAMPLE_COUNT) {
    return null;
  }
  const parsed: ExampleInput[] = [];
  for (const ex of examples) {
    if (typeof ex !== 'object' || ex === null) {
      return null;
    }
    const { sentenceEn, translations } = ex as Record<string, unknown>;
    const parsedTranslations = parseLocalizedText(translations);
    if (typeof sentenceEn !== 'string' || !sentenceEn.trim() || !parsedTranslations) {
      return null;
    }
    parsed.push({ sentenceEn, translations: parsedTranslations });
  }
  return parsed;
}

export const MEANINGS_REQUIRED_MESSAGE = '意味（日本語・中国語）は必須です。';
export const EXAMPLES_REQUIRED_MESSAGE = `例文（英文・日本語訳・中国語訳）は${EXAMPLE_COUNT}つ必須です。`;
