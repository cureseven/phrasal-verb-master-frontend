import { config } from 'dotenv';

// Next.js と同じく .env.local を優先して読む（既に設定済みの環境変数は上書きしない。
// 本番に対してスクリプトを実行するときは DATABASE_URL=... を付けて実行する）。
// Next.js のサーバー自体は環境変数を自動で読むので、これは prisma.config.ts とスクリプト用。
config({ path: ['.env.local', '.env'], quiet: true });
