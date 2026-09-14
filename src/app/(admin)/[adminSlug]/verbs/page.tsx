'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/AdminHeader';
import { PhrasalVerb } from '@/types/phrasalVerb';

export default function AdminVerbsPage() {
  const router = useRouter();
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { admin, loading: authLoading } = useAdminAuth();
  const [verbs, setVerbs] = useState<PhrasalVerb[]>([]);
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
        const data = await apiFetch<PhrasalVerb[]>('/api/verbs');
        setVerbs(data);
      } catch {
        setError('句動詞一覧の取得に失敗しました。');
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
        <AdminHeader title="句動詞一覧" showBackLink />

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">全{verbs.length}件</p>
          <Link
            href={`/${adminSlug}/verbs/new`}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            句動詞を登録する
          </Link>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-500">読み込み中...</p>}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="p-3">動詞</th>
                <th className="p-3">副詞/前置詞</th>
                <th className="p-3">意味</th>
                <th className="p-3">例文</th>
              </tr>
            </thead>
            <tbody>
              {verbs.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3 font-semibold text-indigo-600">{v.verb}</td>
                  <td className="p-3 font-semibold text-emerald-600">{v.particle}</td>
                  <td className="p-3">{v.meaningJa}</td>
                  <td className="p-3 text-gray-500 italic">{v.exampleSentence}</td>
                </tr>
              ))}
              {!loading && verbs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    句動詞が登録されていません。
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
