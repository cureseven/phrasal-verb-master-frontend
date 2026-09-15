import type { Metadata } from 'next';
import '../../globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export const metadata: Metadata = {
  title: 'Admin | Phrasal Verb Master',
  description: '管理画面',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-100 text-gray-800">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
