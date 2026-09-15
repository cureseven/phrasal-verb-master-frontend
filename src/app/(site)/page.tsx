'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FlashcardDemo } from '@/components/FlashcardDemo';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-gray-500">
        読み込み中...
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 bg-gray-50">
        <FlashcardDemo />
      </main>
    );
  }

  return (
    <main className="bg-gray-50">
      {/* 体験デモ */}
      <section className="pt-12 pb-16 px-8">
        <FlashcardDemo />
      </section>

      {/* 新規登録CTA */}
      <section className="flex flex-col items-center text-center px-8 pb-16">
        <Link
          href="/signup"
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
        >
          無料で新規登録する
        </Link>
      </section>

      {/* 会員登録の効果 */}
      <section className="max-w-2xl mx-auto px-8 pb-20">
        <h2 className="text-center text-xl font-bold text-gray-900 mb-6">
          会員登録するとできること
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-semibold text-gray-900 w-1/3">収録語彙をすべて確認</td>
                <td className="p-4 text-gray-600">
                  一覧画面で収録されている句動詞を動詞・前置詞で絞り込んで閲覧できます。
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-gray-900">覚えた／覚えてないを記録</td>
                <td className="p-4 text-gray-600">
                  クイズで学習した句動詞の定着度を記録し、マイページで進捗を確認できます。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
