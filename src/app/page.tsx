'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PhrasalVerb } from '@/types/phrasalVerb';

type RelatedType = 'verb' | 'particle';

export default function HomePage() {
  const [card, setCard] = useState<PhrasalVerb | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRandom = async () => {
      try {
        const data = await apiFetch<PhrasalVerb>('/api/quiz/next');
        setCard(data);
      } catch {
        setError('句動詞の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    loadRandom();
  }, []);

  const handleWordClick = async (type: RelatedType) => {
    if (!card) return;
    const value = type === 'verb' ? card.verb : card.particle;

    try {
      const related = await apiFetch<PhrasalVerb[]>(
        `/api/verbs/related?type=${type}&value=${encodeURIComponent(value)}`
      );
      const candidates = related.filter((v) => v.id !== card.id);
      if (candidates.length === 0) return;
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      setCard(next);
      setShowMeaning(false);
    } catch {
      setError('句動詞の切り替えに失敗しました。');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-gray-500">
        読み込み中...
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-red-600">
        {error || '句動詞が見つかりません。'}
      </main>
    );
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 bg-gray-50">
      <div className="flex flex-col items-center w-full max-w-md gap-6">
        <div className="flex gap-4 w-full">
          <button
            onClick={() => handleWordClick('verb')}
            className="flex-1 bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-md hover:bg-indigo-50 transition text-center cursor-pointer group"
          >
            <span className="text-xs text-indigo-500 block mb-1 font-semibold">VERB</span>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600">
              {card.verb}
            </span>
          </button>

          <button
            onClick={() => handleWordClick('particle')}
            className="flex-1 bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-md hover:bg-emerald-50 transition text-center cursor-pointer group"
          >
            <span className="text-xs text-emerald-500 block mb-1 font-semibold">PARTICLE</span>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600">
              {card.particle}
            </span>
          </button>
        </div>

        <div
          onClick={() => setShowMeaning(!showMeaning)}
          className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-h-[120px] flex flex-col justify-center items-center text-center cursor-pointer hover:bg-gray-50 transition"
        >
          {showMeaning ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">{card.meaningJa}</p>
              <p className="text-sm text-gray-500 italic">&quot;{card.exampleSentence}&quot;</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">クリックして日本語訳を表示</p>
          )}
        </div>

        <p className="text-xs text-gray-400">
          単語をクリックすると別の句動詞に切り替わります
        </p>
      </div>
    </main>
  );
}
