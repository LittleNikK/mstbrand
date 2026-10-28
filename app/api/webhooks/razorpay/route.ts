import { NextResponse } from 'next/server';
import { verifyWebhookSignature, recordWebhookEvent } from '@/lib/services/payment.service';
import { markOrderPaid } from '@/lib/services/order.service';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;

    // Idempotency check: returns false if already processed
    const isNew = await recordWebhookEvent(eventId, 'razorpay', payload);
    if (!isNew) {
      return NextResponse.json({ status: 'ignored_duplicate' });
    }

    const eventType = payload.event;
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderReceipt = paymentEntity?.notes?.orderNumber;

      if (orderReceipt) {
        await markOrderPaid(orderReceipt, {
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id,
          provider: 'razorpay_webhook',
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
