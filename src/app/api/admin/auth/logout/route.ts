import { clearAuthCookie, handle, noContent } from '@/server/http';
import { ADMIN_AUTH_COOKIE_NAME } from '@/server/auth';

export const POST = handle(async () => clearAuthCookie(noContent(), ADMIN_AUTH_COOKIE_NAME));
