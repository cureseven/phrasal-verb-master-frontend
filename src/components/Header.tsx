'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

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
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <Logo size={28} />
          Phrasal Verb Master
        </Link>
        {user && (
          <Link href="/list" className="text-sm text-gray-600 hover:underline">
            一覧
          </Link>
        )}
      </div>

      <nav className="flex items-center gap-4 text-sm">
        {loading ? null : user ? (
          <>
            <Link href="/mypage" className="text-gray-600 hover:underline">
              {user.username || user.email}
            </Link>
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
