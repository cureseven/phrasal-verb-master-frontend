import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export const metadata: Metadata = {
  title: 'Admin | Phrasal Verb Master',
  description: '管理画面',
};

export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;

  // サーバー専用の環境変数（NEXT_PUBLIC_を付けない）とURLセグメントを比較する。
  // 一致しなければ管理画面の存在自体を悟らせないよう、本物の404を返す。
  const expectedSlug = process.env.ADMIN_URL_SLUG;
  if (!expectedSlug || adminSlug !== expectedSlug) {
    notFound();
  }

  return (
    <html lang="ja" className="h-full antialiased">
      {/*
        globals.cssのbody{background:var(--background)}はレイヤー無しのプレーンCSSのため、
        Tailwindのユーティリティクラス（@layerに属する）より優先されてしまい、
        システムのダークモード時に背景が真っ黒・文字が読めなくなる。
        インラインstyleで明示的に上書きして管理画面は常にライトテーマに固定する。
      */}
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}
      >
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
