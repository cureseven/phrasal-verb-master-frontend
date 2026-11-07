import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/lib/prisma';
import { AuthError } from './authService';

const JWT_EXPIRES_IN = '7d';

// 一般ユーザー用トークン（USER_TOKEN_AUDIENCE）と区別するためのaudience
export const ADMIN_TOKEN_AUDIENCE = 'admin';

function getJwtSecret(): string {
  // モジュール読み込み時ではなくリクエスト時に読む（ビルド時に環境変数が無くても動くように）
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export class AdminAuthService {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new AuthError('メールアドレスまたはパスワードが正しくありません。', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new AuthError('メールアドレスまたはパスワードが正しくありません。', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ adminId: admin.id }, getJwtSecret(), {
      expiresIn: JWT_EXPIRES_IN,
      audience: ADMIN_TOKEN_AUDIENCE,
    });

    return { token, admin: { id: admin.id, email: admin.email } };
  }
}
