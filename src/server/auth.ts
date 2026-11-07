import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/lib/prisma';
import { apiError } from '@/server/http';
import { USER_TOKEN_AUDIENCE } from '@/server/services/authService';
import { ADMIN_TOKEN_AUDIENCE } from '@/server/services/adminAuthService';

export const AUTH_COOKIE_NAME = 'pvm_token';
export const ADMIN_AUTH_COOKIE_NAME = 'pvm_admin_token';

function idFromPayload(payload: string | jwt.JwtPayload, key: 'userId' | 'adminId'): string | null {
  if (typeof payload !== 'object') return null;
  const value = payload[key];
  return typeof value === 'string' ? value : null;
}

/** 未ログイン・トークン無効でも null を返すだけ。ログイン中の場合だけ挙動を変えたい公開APIで使う */
export function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    return idFromPayload(jwt.verify(token, secret, { audience: USER_TOKEN_AUDIENCE }), 'userId');
  } catch {
    return null;
  }
}

/** ユーザーIDを返す。認証できなければ、そのまま返すべき401/500のResponseを返す */
export function requireUser(req: NextRequest): string | Response {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return apiError(401, '認証が必要です。', 'AUTH_REQUIRED');
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return apiError(500, 'サーバー設定エラーです。', 'SERVER_ERROR');
  }
  let userId: string | null;
  try {
    userId = idFromPayload(jwt.verify(token, secret, { audience: USER_TOKEN_AUDIENCE }), 'userId');
  } catch {
    return apiError(401, '認証の有効期限が切れています。再度ログインしてください。', 'SESSION_EXPIRED');
  }
  return userId ?? apiError(401, '認証が必要です。', 'AUTH_REQUIRED');
}

/** 管理者が読み取り専用に設定したユーザーの書き込み系操作を止める。通過できるなら null */
export async function checkWritable(userId: string): Promise<Response | null> {
  try {
    const status = await prisma.userAccountStatus.findUnique({
      where: { userId },
      select: { isReadOnly: true },
    });
    if (status?.isReadOnly) {
      return apiError(403, 'このアカウントは現在、閲覧のみご利用いただけます。', 'READ_ONLY_ACCOUNT');
    }
    return null;
  } catch (error) {
    console.error('requireWritable failed:', error);
    return apiError(500, 'サーバーエラーが発生しました。', 'SERVER_ERROR');
  }
}

/** 管理者IDを返す。管理画面向けAPIは日本語のみのため code を付けない */
export async function requireAdmin(req: NextRequest): Promise<string | Response> {
  const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return apiError(401, '認証が必要です。');
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return apiError(500, 'サーバー設定エラーです。');
  }
  let adminId: string | null;
  try {
    adminId = idFromPayload(jwt.verify(token, secret, { audience: ADMIN_TOKEN_AUDIENCE }), 'adminId');
  } catch {
    return apiError(401, '認証の有効期限が切れています。再度ログインしてください。');
  }
  if (!adminId) {
    return apiError(401, '認証が必要です。');
  }
  // 削除済みの管理者のトークンを有効期限まで使えないよう、毎回実在を確認する
  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { id: true } });
    if (!admin) {
      return apiError(401, '認証が必要です。');
    }
  } catch (error) {
    console.error('requireAdminAuth failed:', error);
    return apiError(500, 'サーバーエラーが発生しました。');
  }
  return adminId;
}
