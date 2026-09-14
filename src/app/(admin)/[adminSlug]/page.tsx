'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/AdminHeader';
import { AdminStats } from '@/types/admin';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { admin, loading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push(`/${adminSlug}/login`);
    }
  }, [authLoading, admin, adminSlug, router]);

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      try {
        const data = await apiFetch<AdminStats>('/api/admin/stats');
        setStats(data);
      } catch {
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [admin]);

  if (authLoading || !admin) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <AdminHeader title="管理ダッシュボード" />

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-500">読み込み中...</p>}

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="ユーザー数" value={stats.totalUsers} href={`/${adminSlug}/users`} />
            <StatCard
              label="句動詞数"
              value={stats.totalPhrasalVerbs}
              href={`/${adminSlug}/verbs`}
            />
            <StatCard label="覚えた合計" value={stats.totalMemorized} accent="text-emerald-600" />
            <StatCard label="覚えてない合計" value={stats.totalReviewNeeded} accent="text-red-500" />
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: number;
  accent?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:shadow-md transition rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
