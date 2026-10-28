import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = await getDb();
    if (!ObjectId.isValid(session.userId)) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.userId) },
      { projection: { passwordHash: 0, resetTokenHash: 0 } }
    );

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
