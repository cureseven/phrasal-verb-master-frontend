'use client';

import { LOCALES, Locale } from '@/i18n/config';
import { AdminVerbExample, LocalizedText } from '@/types/admin';

// 管理画面は日本語のみなので、言語名もここで日本語で持つ
const LOCALE_NAMES: Record<Locale, string> = {
  ja: '日本語',
  zh: '中国語（簡体字）',
};

const INPUT_CLASS =
  'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800';

export function emptyLocalizedText(): LocalizedText {
  return Object.fromEntries(LOCALES.map((l) => [l, ''])) as LocalizedText;
}

export function emptyExamples(count: number): AdminVerbExample[] {
  return Array.from({ length: count }, () => ({ sentenceEn: '', translations: emptyLocalizedText() }));
}

interface Props {
  meanings: LocalizedText;
  onMeaningsChange: (meanings: LocalizedText) => void;
  examples: AdminVerbExample[];
  onExamplesChange: (examples: AdminVerbExample[]) => void;
}

/** 句動詞の登録・編集フォームのうち、言語ごとの意味と例文（英文＋各言語の訳）の入力欄 */
export function AdminVerbTranslationFields({
  meanings,
  onMeaningsChange,
  examples,
  onExamplesChange,
}: Props) {
  const updateExample = (index: number, update: (ex: AdminVerbExample) => AdminVerbExample) => {
    onExamplesChange(examples.map((ex, i) => (i === index ? update(ex) : ex)));
  };

  return (
    <>
      {LOCALES.map((locale) => (
        <label key={locale} className="flex flex-col gap-1 text-sm text-gray-700">
          意味（{LOCALE_NAMES[locale]}）
          <input
            type="text"
            required
            lang={locale}
            value={meanings[locale]}
            onChange={(e) => onMeaningsChange({ ...meanings, [locale]: e.target.value })}
            className={INPUT_CLASS}
          />
        </label>
      ))}

      <div className="flex flex-col gap-3">
        {examples.map((ex, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-500">例文 {i + 1}</p>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              英文
              <input
                type="text"
                required
                lang="en"
                value={ex.sentenceEn}
                onChange={(e) => updateExample(i, (prev) => ({ ...prev, sentenceEn: e.target.value }))}
                className={INPUT_CLASS}
              />
            </label>
            {LOCALES.map((locale) => (
              <label key={locale} className="flex flex-col gap-1 text-sm text-gray-700">
                {LOCALE_NAMES[locale]}訳
                <input
                  type="text"
                  required
                  lang={locale}
                  value={ex.translations[locale]}
                  onChange={(e) =>
                    updateExample(i, (prev) => ({
                      ...prev,
                      translations: { ...prev.translations, [locale]: e.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
