import { NextRequest, NextResponse } from 'next/server';
import type { ErrorCode } from '@/server/lib/errorCode';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** APIのレスポンスは個人ごと・乱数を含むため、常にキャッシュさせない */
export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

/** 一般向けAPIは code を付ける（フロントが表示言語のメッセージに変換する）。管理画面向けAPIは日本語のみのため code なし */
export function apiError(status: number, error: string, code?: ErrorCode): NextResponse {
  return json(code ? { error, code } : { error }, status);
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: ErrorCode
  ) {
    super(message);
  }
}

/** JSONボディを読む。空ボディは {}、JSONとして不正なら400、オブジェクト以外は {} として扱う */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text.trim()) {
    return {};
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError('リクエストの形式が正しくありません。', 400, 'BAD_REQUEST');
  }
  return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

type Handler<P> = (req: NextRequest, ctx: { params: Promise<P> }) => Promise<Response>;

/** 想定外の例外を、Expressのエラーハンドラと同じ形のJSON（500）にする */
export function handle<P = Record<string, never>>(fn: Handler<P>): Handler<P> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return apiError(error.status, error.message, error.code);
      }
      console.error('Unhandled error:', error);
      return apiError(500, '予期しないエラーが発生しました。');
    }
  };
}

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

// 画面とAPIが同じドメインになったため SameSite=Lax（以前はRenderとの別ドメイン間で送るため None だった）
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setAuthCookie(res: NextResponse, name: string, token: string): NextResponse {
  res.cookies.set(name, token, { ...cookieOptions(), maxAge: SEVEN_DAYS_SECONDS });
  return res;
}

export function clearAuthCookie(res: NextResponse, name: string): NextResponse {
  res.cookies.set(name, '', { ...cookieOptions(), maxAge: 0 });
  return res;
}
