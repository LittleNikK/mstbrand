import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { createOrder } from '@/lib/services/order.service';
import { createRazorpayOrder } from '@/lib/services/payment.service';
import { checkoutSchema } from '@/lib/validations/checkout';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { checkoutData, cartItems } = body;

    const validatedInput = checkoutSchema.safeParse(checkoutData);
    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid checkout details', details: validatedInput.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Create order with atomic inventory reservation and authoritative price calculations
    const { order } = await createOrder(
      validatedInput.data,
      cartItems,
      session?.userId
    );

    // 2. If payment method is Razorpay or test mode, generate gateway order
    let paymentInfo = null;
    if (order.paymentMethod === 'razorpay' || order.paymentMethod === 'test_mode') {
      paymentInfo = await createRazorpayOrder(order.orderNumber, order.total);
    }

    return NextResponse.json({
      success: true,
      order,
      paymentInfo,
    });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
