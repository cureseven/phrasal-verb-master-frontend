import { clearAuthCookie, handle, noContent } from '@/server/http';
import { AUTH_COOKIE_NAME } from '@/server/auth';

export const POST = handle(async () => clearAuthCookie(noContent(), AUTH_COOKIE_NAME));
