import { NextRequest, NextResponse } from 'next/server';

const ADMIN_HOST_PREFIX = 'admin.';
const ADMIN_PATH_PREFIX = '/admin';

// 管理画面はドメイン（admin.のサブドメイン）で判定する。
// 管理用サブドメインへのアクセスは /admin 配下の内部パスへ透過的にリライトし、
// 逆にメインドメインからの /admin 配下への直接アクセスは404にして到達できないようにする。
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|icon.svg).*)'],
};
