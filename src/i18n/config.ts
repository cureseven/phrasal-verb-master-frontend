// 対応言語。zh は簡体字中国語。URLの先頭（/ja, /zh）とAPIの ?lang= に同じ値を使う。
export const LOCALES = ['ja', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ja';

// 言語切り替えボタンで選んだ言語を覚えておくCookie。proxy.ts で言語なしのURLを振り分けるときに使う。
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// <html lang> に入れる値
export const HTML_LANG: Record<Locale, string> = {
  ja: 'ja',
  zh: 'zh-CN',
};

// 言語切り替えボタンの表示名（各言語での自称）
export const LOCALE_LABELS: Record<Locale, string> = {
  ja: '日本語',
  zh: '中文',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Accept-Language ヘッダーから対応言語を選ぶ。どれにも当てはまらなければ既定の言語にする。 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter(({ q }) => !Number.isNaN(q) && q > 0)
    .sort((a, b) => b.q - a.q);

  return ranked.map(({ lang }) => lang).find(isLocale) ?? DEFAULT_LOCALE;
}

/** 現在のパスの言語部分だけを差し替える（/ja/list → /zh/list） */
export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    segments[1] = locale;
    return segments.join('/');
  }
  return `/${locale}${pathname === '/' ? '' : pathname}`;
}
