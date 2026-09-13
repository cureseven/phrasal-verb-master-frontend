import Link from 'next/link';

export default function HomePage() {
  const pages = [
    { path: '/quiz', label: 'Quiz Page' },
    { path: '/list', label: 'List Page' },
    // 他に作成したページがあればここに追加
  ];

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Debug Navigation</h1>
      <ul style={{ lineHeight: '2' }}>
        {pages.map((page) => (
          <li key={page.path}>
            <Link href={page.path} style={{ color: '#0070f3', fontSize: '1.2rem' }}>
              {page.label} (`{page.path}`)
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}