import { AuthError } from '@/server/services/authService';
import { AdminAuthService } from '@/server/services/adminAuthService';
import { apiError, handle, json, readJson, setAuthCookie } from '@/server/http';
import { ADMIN_AUTH_COOKIE_NAME } from '@/server/auth';
import { validateAdminCredentials } from '@/server/validation';

const adminAuthService = new AdminAuthService();

export const POST = handle(async (req) => {
  const { email, password } = await readJson(req);
  const validationError = validateAdminCredentials(email, password);
  if (validationError) {
    return apiError(400, validationError);
  }

  try {
    const { token, admin } = await adminAuthService.login(email as string, password as string);
    return setAuthCookie(json({ admin }), ADMIN_AUTH_COOKIE_NAME, token);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(error.status, error.message);
    }
    console.error('admin login failed:', error);
    return apiError(500, 'ログインに失敗しました。');
  }
});
