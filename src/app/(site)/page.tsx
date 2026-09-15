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
      {/* ヒーロー */}
      <section className="flex flex-col items-center text-center px-8 py-20 bg-white border-b border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">句動詞を、体で覚える。</h1>
        <p className="text-gray-600 max-w-xl mb-8">
          take off、turn on、give up...動詞と前置詞の組み合わせをカードをめくる感覚で
          直感的に学べる、句動詞学習アプリ。会員登録なしでも今すぐ試せます。
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
          >
            無料で新規登録
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="max-w-4xl mx-auto px-8 py-16 grid gap-10 sm:grid-cols-3">
        <FeatureCard
          title="クリックで切り替え"
          desc="動詞や前置詞をクリックすると、ペアになる別の句動詞に瞬時に切り替わります。"
        />
        <FeatureCard
          title="一覧・絞り込み"
          desc="収録された句動詞を動詞・前置詞で絞り込んで一覧できます（要ログイン）。"
        />
        <FeatureCard
          title="クイズで定着"
          desc="「覚えた／覚えてない」を記録しながらクイズ形式で復習し、進捗をマイページで確認できます。"
        />
      </section>

      {/* 体験デモ */}
      <section className="bg-white border-y border-gray-100 py-16 px-8">
        <h2 className="text-center text-xl font-bold text-gray-900 mb-8">実際に触ってみる</h2>
        <FlashcardDemo />
      </section>

      {/* 最終CTA */}
      <section className="flex flex-col items-center text-center px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">今すぐ始めよう</h2>
        <Link
          href="/signup"
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
        >
          無料で新規登録する
        </Link>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center">
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
