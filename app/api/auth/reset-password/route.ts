import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db/mongodb';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const { token, password } = result.data;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const db = await getDb();
    const user = await db.collection('users').findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(password);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: newPasswordHash,
          updatedAt: new Date().toISOString(),
        },
        $unset: {
          resetTokenHash: '',
          resetTokenExpires: '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
