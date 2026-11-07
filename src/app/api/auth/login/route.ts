import { AuthError, AuthService } from '@/server/services/authService';
import { apiError, handle, json, readJson, setAuthCookie } from '@/server/http';
import { AUTH_COOKIE_NAME } from '@/server/auth';
import { validateCredentials } from '@/server/validation';

const authService = new AuthService();

export const POST = handle(async (req) => {
  const { email, password } = await readJson(req);
  const validationError = validateCredentials(email, password);
  if (validationError) {
    return json(validationError, 400);
  }

  try {
    const { token, user } = await authService.login(email as string, password as string);
    return setAuthCookie(json({ user }), AUTH_COOKIE_NAME, token);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(error.status, error.message, error.code);
    }
    console.error('login failed:', error);
    return apiError(500, 'ログインに失敗しました。', 'SERVER_ERROR');
  }
});
