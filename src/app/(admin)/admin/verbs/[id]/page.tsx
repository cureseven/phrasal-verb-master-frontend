'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/AdminHeader';
import { PhrasalVerb } from '@/types/phrasalVerb';

interface ExampleForm {
  sentenceEn: string;
  sentenceJa: string;
}

export default function AdminVerbDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { admin, loading: authLoading } = useAdminAuth();
  const [verb, setVerb] = useState<PhrasalVerb | null>(null);
  const [meaningJa, setMeaningJa] = useState('');
  const [examples, setExamples] = useState<ExampleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/login');
    }
  }, [authLoading, admin, router]);

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      try {
        const data = await apiFetch<PhrasalVerb>(`/api/verbs/${id}`);
        setVerb(data);
        setMeaningJa(data.meaningJa);
        setExamples(data.examples.map((ex) => ({ sentenceEn: ex.sentenceEn, sentenceJa: ex.sentenceJa })));
      } catch {
        setError('句動詞の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [admin, id]);

  const updateExample = (index: number, field: keyof ExampleForm, value: string) => {
    setExamples((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/api/admin/verbs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ meaningJa, examples }),
      });
      router.push('/verbs');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!verb) return;
    if (!confirm(`「${verb.verb} ${verb.particle}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/verbs/${id}`, { method: 'DELETE' });
      router.push('/verbs');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '削除に失敗しました。');
      setDeleting(false);
    }
  };

  if (authLoading || !admin || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!verb) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="w-full max-w-lg">
          <AdminHeader title="句動詞の編集" showBackLink />
          <p className="text-red-600">{error || '句動詞が見つかりません。'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-lg">
        <AdminHeader title="句動詞の編集" showBackLink />

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              動詞
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500">
                {verb.verb}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              副詞/前置詞
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500">
                {verb.particle}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            動詞・副詞/前置詞は句動詞の識別情報のため変更できません。変更したい場合は削除して登録し直してください。
          </p>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            意味（日本語）
            <input
              type="text"
              required
              value={meaningJa}
              onChange={(e) => setMeaningJa(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </label>

          <div className="flex flex-col gap-3">
            {examples.map((ex, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-500">例文 {i + 1}</p>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  英文
                  <input
                    type="text"
                    required
                    value={ex.sentenceEn}
                    onChange={(e) => updateExample(i, 'sentenceEn', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  日本語訳
                  <input
                    type="text"
                    required
                    value={ex.sentenceJa}
                    onChange={(e) => updateExample(i, 'sentenceJa', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </label>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || deleting}
            className="mt-2 w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? '更新中...' : '更新する'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || deleting}
            className="w-full py-3 bg-white border-2 border-red-400 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? '削除中...' : 'この句動詞を削除する'}
          </button>
        </form>
      </div>
    </main>
  );
}
