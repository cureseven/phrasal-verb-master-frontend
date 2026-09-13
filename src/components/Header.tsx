'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-gray-900">
          Phrasal Verb Master
        </Link>
        <Link href="/list" className="text-sm text-gray-600 hover:underline">
          一覧
        </Link>
        <Link href="/quiz" className="text-sm text-gray-600 hover:underline">
          クイズ
        </Link>
      </div>

      <nav className="flex items-center gap-4 text-sm">
        {loading ? null : user ? (
          <>
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-indigo-600 font-semibold hover:underline"
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:underline">
              ログイン
            </Link>
            <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
              新規登録
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
