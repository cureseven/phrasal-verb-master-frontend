'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PhrasalVerb } from '@/types/phrasalVerb';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { highlightPhrasalVerb } from '@/lib/highlightPhrasalVerb';

type StatusFilter = '' | 'memorized' | 'review_needed';

export default function ListPage() {
  const { user } = useAuth();
  const { locale, t } = useI18n();
  const [allVerbs, setAllVerbs] = useState<PhrasalVerb[]>([]);
  const [statusFilteredVerbs, setStatusFilteredVerbs] = useState<PhrasalVerb[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState('');
  const [selectedParticle, setSelectedParticle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('');

  // マイページなどからの ?status=review_needed 等のディープリンクに対応
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('status');
    if (initial === 'memorized' || initial === 'review_needed') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- window.locationはSSR時に読めないため初回マウント時に同期する
      setSelectedStatus(initial);
    }
  }, []);

  // ドロップダウンの選択肢を作るための全件取得（ステータス絞り込みには影響されない）
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<PhrasalVerb[]>(`/api/verbs?lang=${locale}`);
        setAllVerbs(data);
      } catch {
        setError(t.list.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale, t]);

  // 学習ステータスはユーザーごとのデータのためサーバー側で絞り込む
  useEffect(() => {
    if (!selectedStatus || !user) {
      return;
    }
    const load = async () => {
      try {
        const data = await apiFetch<PhrasalVerb[]>(
          `/api/verbs?status=${encodeURIComponent(selectedStatus)}&lang=${locale}`
        );
        setStatusFilteredVerbs(data);
      } catch {
        setError(t.list.fetchFailed);
      }
    };
    load();
  }, [selectedStatus, user, locale, t]);

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
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t.list.title}</h1>

        <div className="flex gap-4 mb-6">
          <select
            value={selectedVerb}
            onChange={(e) => setSelectedVerb(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
          >
            <option value="">{t.list.verbAll}</option>
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
            <option value="">{t.list.particleAll}</option>
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
              <option value="">{t.list.statusAll}</option>
              <option value="memorized">{t.common.memorized}</option>
              <option value="review_needed">{t.common.reviewNeeded}</option>
            </select>
          )}
        </div>

        {loading && <p className="text-gray-500">{t.common.loading}</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-3">{t.common.count(filteredVerbs.length)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVerbs.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                >
                  <p className="font-bold text-gray-900">
                    {v.verb} <span className="text-emerald-600">{v.particle}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{v.meaning}</p>
                  {v.examples[0] && (
                    <p className="text-xs text-gray-400 italic mt-2">
                      &quot;{highlightPhrasalVerb(v.examples[0].sentenceEn, v.verb, v.particle)}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
