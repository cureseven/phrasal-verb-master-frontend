'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nContext';

interface ProgressSummary {
  totalCount: number;
  memorizedCount: number;
  reviewNeededCount: number;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, href } = useI18n();
  const router = useRouter();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(href('/login'));
    }
  }, [authLoading, user, router, href]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await apiFetch<ProgressSummary>('/api/progress/summary');
        setSummary(data);
      } catch {
        setError(t.mypage.fetchFailed);
      }
    };
    load();
  }, [user, t]);

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center text-gray-500">{t.common.loading}</div>;
  }

  const progressRate =
    summary && summary.totalCount > 0
      ? Math.round((summary.memorizedCount / summary.totalCount) * 100)
      : 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t.mypage.title}</h1>
          <Link href={href('/mypage/settings')} className="text-sm text-indigo-600 font-semibold hover:underline">
            {t.mypage.settingsLink}
          </Link>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {summary && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t.mypage.progress}</span>
                <span>
                  {summary.memorizedCount} / {summary.totalCount}（{progressRate}%）
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${progressRate}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-700 pt-2 border-t border-gray-100">
              <span>{t.common.memorized}</span>
              <span className="font-semibold text-emerald-600">{t.common.count(summary.memorizedCount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{t.common.reviewNeeded}</span>
              <span className="font-semibold text-red-500">{t.common.count(summary.reviewNeededCount)}</span>
            </div>

            <Link
              href={href('/list?status=review_needed')}
              className="mt-2 w-full py-3 text-center bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
            >
              {t.mypage.reviewLink}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
