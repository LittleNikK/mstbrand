import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { getCartForUserOrGuest, saveCart, calculateCart } from '@/lib/services/cart.service';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId') || undefined;

    const cart = await getCartForUserOrGuest(session?.userId, guestId);
    if (!cart) {
      return NextResponse.json({
        cart: {
          items: [],
          subtotal: 0,
          shippingFee: 0,
          discountAmount: 0,
          total: 0,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { items, guestId, discountCode } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items payload' }, { status: 400 });
    }

    const cart = await saveCart(items, session?.userId, guestId, discountCode);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Validate discount code on current cart
  try {
    const body = await request.json();
    const { items, discountCode } = body;

    const calc = await calculateCart(items || [], discountCode);
    return NextResponse.json({ calculation: calc });
  } catch (error) {
    console.error('Cart discount validation error:', error);
    return NextResponse.json({ error: 'Failed to validate discount code' }, { status: 500 });
  }
}
