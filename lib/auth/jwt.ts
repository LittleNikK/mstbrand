import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/config/env';
import { UserSession } from '@/types';

const secretKey = new TextEncoder().encode(env.AUTH_SECRET);
const COOKIE_NAME = 'mst_store_session';
const LEGACY_COOKIE_NAME = 'second_story_session';
const TOKEN_EXPIRY = '7d';

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'customer' | 'staff' | 'admin',
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, LEGACY_COOKIE_NAME };
