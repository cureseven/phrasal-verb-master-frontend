import { prisma } from '@/server/lib/prisma';
import { AuthError, AuthService } from '@/server/services/authService';
import { apiError, clearAuthCookie, handle, json, noContent, readJson } from '@/server/http';
import { AUTH_COOKIE_NAME, requireUser } from '@/server/auth';
import { MAX_USERNAME_LENGTH } from '@/server/validation';

const authService = new AuthService();

export const GET = handle(async (req) => {
  const userId = requireUser(req);
  if (typeof userId !== 'string') return userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });
  if (!user) {
    // トークンは有効だがユーザーが削除済みなどのケース。クライアントには未認証として扱わせる。
    return clearAuthCookie(apiError(401, '認証が必要です。', 'AUTH_REQUIRED'), AUTH_COOKIE_NAME);
  }
  return json({ user });
});

export const PATCH = handle(async (req) => {
  const userId = requireUser(req);
  if (typeof userId !== 'string') return userId;

  const { username } = await readJson(req);
  if (typeof username !== 'string' || !username.trim()) {
    return apiError(400, 'ユーザー名を入力してください。', 'USERNAME_REQUIRED');
  }
  const trimmed = username.trim();
  if (trimmed.length > MAX_USERNAME_LENGTH) {
    return apiError(
      400,
      `ユーザー名は${MAX_USERNAME_LENGTH}文字以内で入力してください。`,
      'USERNAME_TOO_LONG'
    );
  }

  try {
    const user = await authService.updateUsername(userId, trimmed);
    return json({ user });
  } catch (error) {
    console.error('updateUsername failed:', error);
    return apiError(500, 'ユーザー名の更新に失敗しました。', 'SERVER_ERROR');
  }
});

export const DELETE = handle(async (req) => {
  const userId = requireUser(req);
  if (typeof userId !== 'string') return userId;

  const { password } = await readJson(req);
  if (typeof password !== 'string' || !password) {
    return apiError(400, 'パスワードを入力してください。', 'PASSWORD_REQUIRED');
  }

  try {
    await authService.deleteAccount(userId, password);
    return clearAuthCookie(noContent(), AUTH_COOKIE_NAME);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(error.status, error.message, error.code);
    }
    console.error('deleteAccount failed:', error);
    return apiError(500, 'アカウントの削除に失敗しました。', 'SERVER_ERROR');
  }
});
