'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const { user, loading, logout } = useAuth();
  const { t, href } = useI18n();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.push(href('/'));
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href={href('/')} className="flex items-center gap-2 font-bold text-gray-900">
            <Logo size={28} />
            Phrasal Verb Master
          </Link>
          {user && (
            <Link href={href('/list')} className="hidden sm:inline text-sm text-gray-600 hover:underline">
              {t.header.list}
            </Link>
          )}
        </div>

        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <LanguageSwitcher />
          {loading ? null : user ? (
            <>
              <Link href={href('/mypage')} className="text-gray-600 hover:underline">
                {user.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {t.header.logout}
              </button>
            </>
          ) : (
            <>
              <Link href={href('/login')} className="text-gray-600 hover:underline">
                {t.header.login}
              </Link>
              <Link href={href('/signup')} className="text-indigo-600 font-semibold hover:underline">
                {t.header.signup}
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="sm:hidden flex items-center justify-center w-9 h-9 text-gray-600"
          aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
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
            <Link href={href('/list')} className="py-2 text-gray-600" onClick={closeMenu}>
              {t.header.list}
            </Link>
          )}
          {loading ? null : user ? (
            <>
              <Link href={href('/mypage')} className="py-2 text-gray-600" onClick={closeMenu}>
                {user.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 text-left text-indigo-600 font-semibold"
              >
                {t.header.logout}
              </button>
            </>
          ) : (
            <>
              <Link href={href('/login')} className="py-2 text-gray-600" onClick={closeMenu}>
                {t.header.login}
              </Link>
              <Link
                href={href('/signup')}
                className="py-2 text-indigo-600 font-semibold"
                onClick={closeMenu}
              >
                {t.header.signup}
              </Link>
            </>
          )}
          <div className="py-2">
            <LanguageSwitcher onSwitch={closeMenu} />
          </div>
        </nav>
      )}
    </header>
  );
}
