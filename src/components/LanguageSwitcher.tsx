'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';
import { LOCALE_COOKIE, LOCALE_LABELS, LOCALES, Locale, replaceLocaleInPath } from '@/i18n/config';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// 言語なしのURLで来たときにも選んだ言語で開けるよう、Cookieに覚えておく（proxy.tsが参照する）
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function LanguageSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: Locale) => {
    rememberLocale(next);
    onSwitch?.();
    router.push(`${replaceLocaleInPath(pathname, next)}${window.location.search}`);
  };

  return (
    <div role="group" aria-label={t.header.language} className="flex items-center gap-1 text-sm">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">|</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            disabled={l === locale}
            lang={l}
            className={
              l === locale
                ? 'font-semibold text-gray-900 cursor-default'
                : 'text-gray-500 hover:underline'
            }
          >
            {LOCALE_LABELS[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
