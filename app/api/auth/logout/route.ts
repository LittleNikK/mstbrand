import { NextResponse } from 'next/server';
import { COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(LEGACY_COOKIE_NAME);
  return response;
}
