import { json } from '@/server/http';

export async function GET() {
  return json({ message: 'Phrasal Verb Master API is running!' });
}
