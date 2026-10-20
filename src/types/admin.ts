import type { Locale } from '@/i18n/config';

/** 全言語分の文言（{ ja: '...', zh: '...' }） */
export type LocalizedText = Record<Locale, string>;

export interface AdminVerbExample {
  sentenceEn: string;
  translations: LocalizedText;
}

/** 管理画面向けAPI（GET /api/admin/verbs/:id）のレスポンス。全言語の意味・訳を持つ */
export interface AdminPhrasalVerb {
  id: string;
  verb: string;
  particle: string;
  meanings: LocalizedText;
  examples: AdminVerbExample[];
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface AdminStats {
  totalUsers: number;
  readOnlyUsers: number;
  totalPhrasalVerbs: number;
  totalMemorized: number;
  totalReviewNeeded: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  createdAt: string;
  isReadOnly: boolean;
  memorizedCount: number;
  reviewNeededCount: number;
}
