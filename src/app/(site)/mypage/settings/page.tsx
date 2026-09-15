'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { AuthUser } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ユーザー取得後にフォームの初期値を一度だけ同期
      setUsername(user.username ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await apiFetch<{ user: AuthUser }>('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ username }),
      });
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ユーザー名の更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mypage" className="text-sm text-gray-500 hover:underline">
            ← マイページ
          </Link>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">アカウント設定</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              ユーザー名
              <input
                type="text"
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="未設定"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">保存しました。</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存する'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
