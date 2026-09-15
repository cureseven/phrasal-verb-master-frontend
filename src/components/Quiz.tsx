'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface CardData {
  id: string;
  verb: string;
  particle: string;
  meaningJa: string;
  exampleSentence: string;
}

export function Quiz() {
  const [card, setCard] = useState<CardData | null>(null);
  const [showMeaning, setShowMeaning] = useState<boolean>(false);
  const [alwaysShow, setAlwaysShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [marking, setMarking] = useState<boolean>(false);

  // 直前の固定モードと固定ワードの値を保持
  const lastModeRef = useRef<'verb_fixed' | 'particle_fixed' | null>(null);
  const lastWordRef = useRef<string | null>(null);

  const fetchNextCard = async (mode?: string, word?: string) => {
    setLoading(true);
    if (!alwaysShow) {
      setShowMeaning(false);
    }
    try {
      let url = '/api/quiz/next';
      if (mode && word) {
        url += `?mode=${mode}&word=${encodeURIComponent(word)}`;
      }
      const data = await apiFetch<CardData>(url);
      setCard(data);
    } catch (err) {
      console.error('Failed to fetch card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- マウント時の初回フェッチ
    fetchNextCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMark = async (status: 'memorized' | 'review_needed') => {
    if (!card || marking) return;
    setMarking(true);
    try {
      await apiFetch('/api/progress/mark', {
        method: 'POST',
        body: JSON.stringify({ phrasalVerbId: card.id, status }),
      });
      handleNext();
    } catch (err) {
      console.error('Failed to mark progress:', err);
    } finally {
      setMarking(false);
    }
  };

  // Nextボタン押下時のマルコフ鎖ロジック
  const handleNext = () => {
    let nextMode = lastModeRef.current;
    let nextWord = lastWordRef.current;

    // 履歴が存在する場合、70%の確率で「前回と同じ固定ルール（軸とワード）」を維持する
    if (nextMode !== null && nextWord !== null) {
      const rand = Math.random();
      if (rand >= 0.7) {
        // 残り30%の確率で、軸を入れ替えるか完全ランダムにする
        if (Math.random() < 0.5 && card) {
          // 軸を反転させる（例: verb_fixed だったら particle_fixed にして現在の particle を固定）
          nextMode = nextMode === 'verb_fixed' ? 'particle_fixed' : 'verb_fixed';
          nextWord = nextMode === 'verb_fixed' ? card.verb : card.particle;
        } else {
          // 完全ランダムへ
          nextMode = null;
          nextWord = null;
        }
      }
    }

    lastModeRef.current = nextMode;
    lastWordRef.current = nextWord;
    fetchNextCard(nextMode ?? undefined, nextWord ?? undefined);
  };

  // カードタップ時のハンドラー：クリックした単語を変え、もう一方は固定する（マルコフ鎖の
  // 継続性はNextボタン専用のロジックなので、明示的なクリックには適用しない）
  const handleCardClick = (clickedType: 'verb' | 'particle') => {
    if (!card) return;

    // VERBをクリック ＝ verbを変えたい ＝ particle を固定したい（particle_fixed）
    // PARTICLEをクリック ＝ particleを変えたい ＝ verb を固定したい（verb_fixed）
    const nextMode: 'verb_fixed' | 'particle_fixed' =
      clickedType === 'verb' ? 'particle_fixed' : 'verb_fixed';
    const nextWord = nextMode === 'verb_fixed' ? card.verb : card.particle;

    lastModeRef.current = nextMode;
    lastWordRef.current = nextWord;
    fetchNextCard(nextMode, nextWord);
  };

  const handleAlwaysShowChange = (checked: boolean) => {
    setAlwaysShow(checked);
    if (checked) {
      setShowMeaning(true);
    }
  };

  if (loading && !card) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  const isDisplayed = showMeaning || alwaysShow;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto gap-6">
      <div className="flex gap-4 w-full">
        {/* VERBカード */}
        <button
          onClick={() => handleCardClick('verb')}
          className="flex-1 bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-md hover:bg-indigo-50 transition text-center cursor-pointer group"
        >
          <span className="text-xs text-indigo-500 block mb-1 font-semibold">VERB</span>
          <span className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600">
            {card?.verb}
          </span>
        </button>

        {/* PARTICLEカード */}
        <button
          onClick={() => handleCardClick('particle')}
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
            <p className="text-sm text-gray-500 italic">&quot;{card?.exampleSentence}&quot;</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">クリックして日本語訳を表示</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-4">
        <label className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={alwaysShow}
            onChange={(e) => handleAlwaysShowChange(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          常に日本語訳を表示する
        </label>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleMark('review_needed')}
            disabled={marking}
            className="flex-1 py-3 bg-white border-2 border-red-400 text-red-600 font-semibold rounded-xl shadow-sm hover:bg-red-50 transition disabled:opacity-50"
          >
            覚えてない
          </button>
          <button
            onClick={() => handleMark('memorized')}
            disabled={marking}
            className="flex-1 py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl shadow-sm hover:bg-emerald-50 transition disabled:opacity-50"
          >
            覚えた
          </button>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
