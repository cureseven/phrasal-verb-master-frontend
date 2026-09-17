'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/AdminHeader';

interface ExampleForm {
  sentenceEn: string;
  sentenceJa: string;
}

const EMPTY_EXAMPLES: ExampleForm[] = [
  { sentenceEn: '', sentenceJa: '' },
  { sentenceEn: '', sentenceJa: '' },
  { sentenceEn: '', sentenceJa: '' },
];

export default function AdminNewVerbPage() {
  const router = useRouter();
  const { admin, loading: authLoading } = useAdminAuth();
  const [verb, setVerb] = useState('');
  const [particle, setParticle] = useState('');
  const [meaningJa, setMeaningJa] = useState('');
  const [examples, setExamples] = useState<ExampleForm[]>(EMPTY_EXAMPLES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/login');
    }
  }, [authLoading, admin, router]);

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
      await apiFetch('/api/admin/verbs', {
        method: 'POST',
        body: JSON.stringify({ verb, particle, meaningJa, examples }),
      });
      router.push('/verbs');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登録に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !admin) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-lg">
        <AdminHeader title="句動詞を登録" showBackLink />

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              動詞
              <input
                type="text"
                required
                value={verb}
                onChange={(e) => setVerb(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              副詞/前置詞
              <input
                type="text"
                required
                value={particle}
                onChange={(e) => setParticle(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </label>
          </div>

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
            disabled={submitting}
            className="mt-2 w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </main>
  );
}
