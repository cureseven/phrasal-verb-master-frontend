import { AuthError, AuthService } from '@/server/services/authService';
import { apiError, handle, json, readJson } from '@/server/http';
import { validateCredentials } from '@/server/validation';

const authService = new AuthService();

export const POST = handle(async (req) => {
  const { email, password } = await readJson(req);
  const validationError = validateCredentials(email, password);
  if (validationError) {
    return json(validationError, 400);
  }

  try {
    const user = await authService.signup(email as string, password as string);
    return json({ user }, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(error.status, error.message, error.code);
    }
    console.error('signup failed:', error);
    return apiError(500, 'サインアップに失敗しました。', 'SERVER_ERROR');
  }
});
