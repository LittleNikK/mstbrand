import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { mergeGuestCartIntoUserCart } from '@/lib/services/cart.service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { guestId } = body;

    if (guestId) {
      await mergeGuestCartIntoUserCart(guestId, session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart merge error:', error);
    return NextResponse.json({ error: 'Failed to merge cart' }, { status: 500 });
  }
}
