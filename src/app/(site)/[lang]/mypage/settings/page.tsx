'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AuthUser } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nContext';

export default function AccountSettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const { t, href, errorMessage } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(href('/login'));
    }
  }, [authLoading, user, router, href]);

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
      setError(errorMessage(err, t.settings.updateFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleting(true);
    try {
      await apiFetch('/api/auth/me', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      // user が null になると本コンポーネントの認証ガードが/loginへ遷移させる
      await refresh();
    } catch (err) {
      setDeleteError(errorMessage(err, t.settings.deleteFailed));
      setDeleting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center text-gray-500">{t.common.loading}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Link href={href('/mypage')} className="text-sm text-gray-500 hover:underline">
            {t.settings.back}
          </Link>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t.settings.title}</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              {t.settings.username}
              <input
                type="text"
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.settings.usernamePlaceholder}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{t.settings.saved}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? t.settings.saving : t.settings.save}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 mt-6">
          <h2 className="text-sm font-bold text-red-600 mb-1">{t.settings.deleteTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{t.settings.deleteDescription}</p>

          <form onSubmit={handleDelete} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              {t.settings.deletePassword}
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </label>

            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

            <button
              type="submit"
              disabled={deleting}
              className="w-full py-3 bg-white border-2 border-red-400 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50"
            >
              {deleting ? t.settings.deleting : t.settings.deleteSubmit}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
