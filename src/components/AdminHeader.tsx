'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Logo } from '@/components/Logo';

export function AdminHeader({ title, showBackLink }: { title: string; showBackLink?: boolean }) {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {showBackLink && (
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            ←
          </Link>
        )}
        <Logo size={24} />
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {admin && <span className="text-gray-600">{admin.email}</span>}
        <button onClick={handleLogout} className="text-gray-600 hover:underline">
          ログアウト
        </button>
      </div>
    </div>
  );
}
