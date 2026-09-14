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
      <body className="min-h-full flex flex-col bg-gray-100">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
