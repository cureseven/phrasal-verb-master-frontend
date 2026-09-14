'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/AdminHeader';
import { AdminUserRow } from '@/types/admin';

export default function AdminUsersPage() {
  const router = useRouter();
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { admin, loading: authLoading } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push(`/${adminSlug}/login`);
    }
  }, [authLoading, admin, adminSlug, router]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch<AdminUserRow[]>('/api/admin/users');
      setUsers(data);
    } catch {
      setError('ユーザー一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- マウント時の初回フェッチ
    loadUsers();
  }, [admin, loadUsers]);

  const handleToggleReadOnly = async (user: AdminUserRow) => {
    setUpdatingId(user.id);
    try {
      const action = user.isReadOnly ? 'unrestrict' : 'restrict';
      await apiFetch(`/api/admin/users/${user.id}/${action}`, { method: 'POST' });
      await loadUsers();
    } catch {
      setError('更新に失敗しました。');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !admin) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  const readOnlyCount = users.filter((u) => u.isReadOnly).length;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <AdminHeader title="ユーザー一覧" showBackLink />

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-500">読み込み中...</p>}

        {!loading && (
          <p className="text-sm text-gray-500 mb-3">
            全{users.length}人中、閲覧のみ{readOnlyCount}人
          </p>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="p-3">メールアドレス</th>
                <th className="p-3">登録日</th>
                <th className="p-3">覚えた</th>
                <th className="p-3">覚えてない</th>
                <th className="p-3">状態</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="p-3 text-emerald-600">{user.memorizedCount}</td>
                  <td className="p-3 text-red-500">{user.reviewNeededCount}</td>
                  <td className="p-3">
                    {user.isReadOnly ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                        閲覧のみ
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                        通常
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleReadOnly(user)}
                      disabled={updatingId === user.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {user.isReadOnly ? '解除する' : '読み取り専用にする'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    ユーザーがいません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
