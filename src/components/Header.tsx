'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <Logo size={28} />
            Phrasal Verb Master
          </Link>
          {user && (
            <Link href="/list" className="hidden sm:inline text-sm text-gray-600 hover:underline">
              一覧
            </Link>
          )}
        </div>

        <nav className="hidden sm:flex items-center gap-4 text-sm">
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

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="sm:hidden flex items-center justify-center w-9 h-9 text-gray-600"
          aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="sm:hidden flex flex-col gap-1 px-6 pb-4 text-sm border-t border-gray-100">
          {user && (
            <Link href="/list" className="py-2 text-gray-600" onClick={closeMenu}>
              一覧
            </Link>
          )}
          {loading ? null : user ? (
            <>
              <Link href="/mypage" className="py-2 text-gray-600" onClick={closeMenu}>
                {user.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 text-left text-indigo-600 font-semibold"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="py-2 text-gray-600" onClick={closeMenu}>
                ログイン
              </Link>
              <Link
                href="/signup"
                className="py-2 text-indigo-600 font-semibold"
                onClick={closeMenu}
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
