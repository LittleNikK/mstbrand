import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = result.data;
    const db = await getDb();

    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const insertResult = await db.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
      phone: phone || '',
      addresses: [],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    const sessionPayload = {
      userId: insertResult.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      role: 'customer' as const,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        _id: insertResult.insertedId.toString(),
        name,
        email: email.toLowerCase(),
        role: 'customer',
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
