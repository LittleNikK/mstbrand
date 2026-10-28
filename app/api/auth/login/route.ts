import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email and password' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();
    const db = await getDb();

    let user = await db.collection('users').findOne({ email: normalizedEmail });

    // Self-healing bootstrap for official demo credentials
    const isDemoAdmin = (normalizedEmail === 'admin@mststore.com' || normalizedEmail === 'admin@secondstory.com') && password === 'Admin@123456';
    const isDemoCustomer = (normalizedEmail === 'customer@mststore.com' || normalizedEmail === 'customer@secondstory.com') && (password === 'Customer@123456' || password === 'Admin@123456');

    if (isDemoAdmin) {
      if (!user) {
        const passwordHash = await import('@/lib/auth/password').then(m => m.hashPassword('Admin@123456'));
        const insertRes = await db.collection('users').insertOne({
          name: 'Aditi Sharma (Merch Lead)',
          email: normalizedEmail,
          passwordHash,
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          phone: '+91 98200 12345',
          addresses: [],
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        user = await db.collection('users').findOne({ _id: insertRes.insertedId });
      } else {
        const isMatch = await verifyPassword(password, user.passwordHash);
        if (!isMatch) {
          const newHash = await import('@/lib/auth/password').then(m => m.hashPassword('Admin@123456'));
          await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: newHash, role: 'admin' } });
          user.passwordHash = newHash;
        }
      }
    } else if (isDemoCustomer) {
      if (!user) {
        const passwordHash = await import('@/lib/auth/password').then(m => m.hashPassword(password));
        const insertRes = await db.collection('users').insertOne({
          name: 'Rohan Mehta',
          email: normalizedEmail,
          passwordHash,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          phone: '+91 98201 54321',
          addresses: [],
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        user = await db.collection('users').findOne({ _id: insertRes.insertedId });
      } else {
        const isMatch = await verifyPassword(password, user.passwordHash);
        if (!isMatch) {
          const newHash = await import('@/lib/auth/password').then(m => m.hashPassword(password));
          await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: newHash } });
          user.passwordHash = newHash;
        }
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errObj = error as { name?: string; message?: string } | undefined;
    const isConnError = errObj?.name === 'MongoServerSelectionError' || errObj?.message?.includes('ECONNREFUSED');
    return NextResponse.json(
      {
        error: isConnError
          ? 'Database connection failed. On Vercel, ensure MONGODB_URI is set to a cloud MongoDB Atlas instance.'
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
