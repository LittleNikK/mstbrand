import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/services/payment.service';
import { markOrderPaid, getOrderByNumber } from '@/lib/services/order.service';
import { getDb } from '@/lib/db/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isTestMode,
    } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, order });
    }

    // 1. Verify Signature
    if (!isTestMode) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: 'Incomplete payment credentials' }, { status: 400 });
      }

      const isValid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
      }
    }

    // 2. Transition order to 'paid' and 'processing'
    const updatedOrder = await markOrderPaid(orderNumber, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: isTestMode ? 'test_mode_signature_verified' : razorpaySignature,
      provider: isTestMode ? 'test_mode' : 'razorpay',
    });

    // 3. Record transaction entry in `payments` collection
    const db = await getDb();
    await db.collection('payments').insertOne({
      orderId: order._id,
      orderNumber,
      amount: order.total,
      currency: 'INR',
      provider: isTestMode ? 'test_mode' : 'razorpay',
      transactionId: razorpayPaymentId || `test_txn_${Date.now()}`,
      status: 'success',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
