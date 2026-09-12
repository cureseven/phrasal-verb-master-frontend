'use client';

import { useState, useEffect } from 'react';

interface CardData {
  id: string;
  verb: string;
  particle: string;
  meaningJa: string;
  exampleSentence: string;
}

export default function QuizPage() {
  const [card, setCard] = useState<CardData | null>(null);
  const [showMeaning, setShowMeaning] = useState<boolean>(false);
  const [alwaysShow, setAlwaysShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const fetchNextCard = async (mode?: string, word?: string) => {
    setLoading(true);
    if (!alwaysShow) {
      setShowMeaning(false);
    }
    try {
      let url = `${API_BASE}/api/quiz/next`;
      if (mode && word) {
        url += `?mode=${mode}&word=${encodeURIComponent(word)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCard(data);
    } catch (err) {
      console.error('Failed to fetch card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextCard();
  }, []);

  const handleAlwaysShowChange = (checked: boolean) => {
    setAlwaysShow(checked);
    if (checked) {
      setShowMeaning(true);
    }
  };

  if (loading && !card) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  const isDisplayed = showMeaning || alwaysShow;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-800">Quiz Mode</h1>
      </div>

      <div className="flex flex-col items-center w-full max-w-md gap-6">
        <div className="flex gap-4 w-full">
          <button
            onClick={() => card && fetchNextCard('particle_fixed', card.particle)}
            className="flex-1 bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-md hover:bg-indigo-50 transition text-center cursor-pointer group"
          >
            <span className="text-xs text-indigo-500 block mb-1 font-semibold">VERB</span>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600">
              {card?.verb}
            </span>
          </button>

          <button
            onClick={() => card && fetchNextCard('verb_fixed', card.verb)}
            className="flex-1 bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-md hover:bg-emerald-50 transition text-center cursor-pointer group"
          >
            <span className="text-xs text-emerald-500 block mb-1 font-semibold">PARTICLE</span>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600">
              {card?.particle}
            </span>
          </button>
        </div>

        <div
          onClick={() => !alwaysShow && setShowMeaning(!showMeaning)}
          className={`w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-h-[120px] flex flex-col justify-center items-center text-center transition ${
            !alwaysShow ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
          }`}
        >
          {isDisplayed ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">{card?.meaningJa}</p>
              <p className="text-sm text-gray-500 italic">"{card?.exampleSentence}"</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Click to reveal meaning & example</p>
          )}
        </div>

        {/* 訳ボックスの下に配置したAlways ShowトグルとNextボタン */}
        <div className="w-full flex flex-col gap-4">
          <label className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={alwaysShow}
              onChange={(e) => handleAlwaysShowChange(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            Always show meaning
          </label>

          <button
            onClick={() => fetchNextCard()}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      <div />
    </main>
  );
}