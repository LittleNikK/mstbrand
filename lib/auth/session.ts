import { cookies } from 'next/headers';
import { COOKIE_NAME, LEGACY_COOKIE_NAME, verifySessionToken } from './jwt';
import { UserSession } from '@/types';

export async function getServerSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(): Promise<UserSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth();
  if (session.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export async function requireStaffOrAdmin(): Promise<UserSession> {
  const session = await requireAuth();
  if (session.role !== 'admin' && session.role !== 'staff') {
    throw new Error('FORBIDDEN');
  }
  return session;
}
