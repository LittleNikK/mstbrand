import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env, isRazorpayConfigured } from '@/lib/config/env';
import { getDb } from '@/lib/db/mongodb';

// Initialize Razorpay instance if configured
let razorpayInstance: Razorpay | null = null;

if (isRazorpayConfigured()) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export async function createRazorpayOrder(orderNumber: string, amountInINR: number) {
  const amountInPaise = Math.round(amountInINR * 100);

  if (!isRazorpayConfigured() || !razorpayInstance) {
    // Return a structured test payment payload so the app runs smoothly in development
    return {
      isTestMode: true,
      orderId: `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      currency: env.DEFAULT_CURRENCY,
      amount: amountInPaise,
      keyId: 'rzp_test_placeholder_key',
    };
  }

  const options = {
    amount: amountInPaise,
    currency: env.DEFAULT_CURRENCY,
    receipt: orderNumber,
    notes: {
      orderNumber,
      platform: 'MST Store — Official Merchandise',
    },
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);
  return {
    isTestMode: false,
    orderId: razorpayOrder.id,
    currency: razorpayOrder.currency,
    amount: razorpayOrder.amount,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (!isRazorpayConfigured()) {
    // In local development test mode, verify test signature token
    return razorpaySignature.startsWith('test_sig_') || razorpaySignature === 'test_verified';
  }

  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(razorpaySignature)
  );
}

export function verifyWebhookSignature(payloadBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_WEBHOOK_SECRET === 'webhook_secret_placeholder') {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(payloadBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function recordWebhookEvent(eventId: string, provider: string, payload: Record<string, unknown>): Promise<boolean> {
  const db = await getDb();
  try {
    await db.collection('webhook_events').insertOne({
      eventId,
      provider,
      payload,
      processed: true,
      receivedAt: new Date().toISOString(),
    });
    return true;
  } catch (error: unknown) {
    // Duplicate key error (code 11000) means webhook was already processed idempotently
    if ((error as { code?: number })?.code === 11000) {
      return false;
    }
    throw error;
  }
}
