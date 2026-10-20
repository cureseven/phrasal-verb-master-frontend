import { NextRequest, NextResponse } from 'next/server';
import { isLocale, LOCALE_COOKIE, matchLocale } from '@/i18n/config';

const ADMIN_HOST_PREFIX = 'admin.';
const ADMIN_PATH_PREFIX = '/admin';

// 管理画面はドメイン（admin.のサブドメイン）で判定する。
// 管理用サブドメインへのアクセスは /admin 配下の内部パスへ透過的にリライトし、
// 逆にメインドメインからの /admin 配下への直接アクセスは404にして到達できないようにする。
// メインドメインでは、言語の付いていないURL（/list など）を /ja/list・/zh/list へ転送する。
export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isAdminHost = hostname.startsWith(ADMIN_HOST_PREFIX);
  const { pathname } = request.nextUrl;

  if (isAdminHost) {
    if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `${ADMIN_PATH_PREFIX}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return new NextResponse(null, { status: 404 });
  }

  // public/ 配下の静的ファイル（拡張子つき）は言語の振り分け対象外
  if (isLocale(pathname.split('/')[1]) || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 言語の決め方: 切り替えボタンで選んだ言語（Cookie）→ ブラウザの言語設定 → 日本語
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get('accept-language'));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|icon.svg).*)'],
};
