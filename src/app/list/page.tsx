'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PhrasalVerb } from '@/types/phrasalVerb';
import { useAuth } from '@/contexts/AuthContext';

type StatusFilter = '' | 'memorized' | 'review_needed';

export default function ListPage() {
  const { user } = useAuth();
  const [allVerbs, setAllVerbs] = useState<PhrasalVerb[]>([]);
  const [statusFilteredVerbs, setStatusFilteredVerbs] = useState<PhrasalVerb[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState('');
  const [selectedParticle, setSelectedParticle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('');

  // ドロップダウンの選択肢を作るための全件取得（ステータス絞り込みには影響されない）
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<PhrasalVerb[]>('/api/verbs');
        setAllVerbs(data);
      } catch {
        setError('句動詞一覧の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 学習ステータスはユーザーごとのデータのためサーバー側で絞り込む
  useEffect(() => {
    if (!selectedStatus || !user) {
      return;
    }
    const load = async () => {
      try {
        const data = await apiFetch<PhrasalVerb[]>(
          `/api/verbs?status=${encodeURIComponent(selectedStatus)}`
        );
        setStatusFilteredVerbs(data);
      } catch {
        setError('句動詞一覧の取得に失敗しました。');
      }
    };
    load();
  }, [selectedStatus, user]);

  const verbOptions = useMemo(
    () => Array.from(new Set(allVerbs.map((v) => v.verb))).sort(),
    [allVerbs]
  );
  const particleOptions = useMemo(
    () => Array.from(new Set(allVerbs.map((v) => v.particle))).sort(),
    [allVerbs]
  );

  const baseVerbs = selectedStatus && user && statusFilteredVerbs ? statusFilteredVerbs : allVerbs;

  const filteredVerbs = useMemo(
    () =>
      baseVerbs.filter(
        (v) =>
          (!selectedVerb || v.verb === selectedVerb) &&
          (!selectedParticle || v.particle === selectedParticle)
      ),
    [baseVerbs, selectedVerb, selectedParticle]
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900 mb-6">句動詞一覧</h1>

        <div className="flex gap-4 mb-6">
          <select
            value={selectedVerb}
            onChange={(e) => setSelectedVerb(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
          >
            <option value="">動詞: すべて</option>
            {verbOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedParticle}
            onChange={(e) => setSelectedParticle(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
          >
            <option value="">副詞/前置詞: すべて</option>
            {particleOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {user && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
            >
              <option value="">学習状況: すべて</option>
              <option value="memorized">覚えた</option>
              <option value="review_needed">覚えてない</option>
            </select>
          )}
        </div>

        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-3">{filteredVerbs.length}件</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVerbs.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                >
                  <p className="font-bold text-gray-900">
                    {v.verb} <span className="text-emerald-600">{v.particle}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{v.meaningJa}</p>
                  <p className="text-xs text-gray-400 italic mt-2">&quot;{v.exampleSentence}&quot;</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
