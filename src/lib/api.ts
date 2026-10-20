export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    /** 一般向けAPIのエラーコード（例: INVALID_CREDENTIALS）。画面の言語でメッセージを出すのに使う */
    public code?: string
  ) {
    super(message);
  }
}

// サーバーがスリープから復帰中などで応答できない場合に表示するメッセージ（管理画面用。一般向け画面は code から各言語の文言を出す）
const SERVER_UNAVAILABLE_MESSAGE =
  'サーバーが起動中の可能性があります。数分待ってから再度お試しください。';
const SERVER_UNAVAILABLE_CODE = 'SERVER_UNAVAILABLE';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    // ネットワークエラー（サーバー未応答・DNS失敗など）はレスポンス自体が得られない
    throw new ApiError(SERVER_UNAVAILABLE_MESSAGE, 0, SERVER_UNAVAILABLE_CODE);
  }

  if (!res.ok) {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new ApiError(SERVER_UNAVAILABLE_MESSAGE, res.status, SERVER_UNAVAILABLE_CODE);
    }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.error || 'リクエストに失敗しました。',
      res.status,
      typeof body.code === 'string' ? body.code : undefined
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
