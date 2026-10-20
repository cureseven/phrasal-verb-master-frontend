'use client';

import { createContext, useContext, useMemo } from 'react';
import { ApiError } from '@/lib/api';
import type { Locale } from './config';
import { getDictionary, type Dictionary } from './dictionaries';

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  /** アプリ内のパス（/list など）に現在の言語を付ける */
  href: (path: string) => string;
  /** APIのエラーを表示言語のメッセージにする。コードが無い・未知のときは fallback を使う */
  errorMessage: (err: unknown, fallback: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// 辞書には関数（件数の表示など）が含まれ、サーバーからpropsで渡せないため、言語だけ受け取ってクライアント側で引く
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<I18nContextValue>(() => {
    const t = getDictionary(locale);
    return {
      locale,
      t,
      href: (path) => `/${locale}${path === '/' ? '' : path}`,
      errorMessage: (err, fallback) => {
        if (err instanceof ApiError && err.code && err.code in t.errors) {
          return t.errors[err.code as keyof Dictionary['errors']];
        }
        return fallback;
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
