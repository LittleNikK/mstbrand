import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Payment Signatures and Order State Transitions', () => {
  const SECRET = 'test_secret_for_razorpay_hmac_sha256';

  function verifyHmac(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return generated === signature;
  }

  it('correctly validates HMAC-SHA256 payment signature', () => {
    const orderId = 'order_DA291041';
    const paymentId = 'pay_90812401';

    const validSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(verifyHmac(orderId, paymentId, validSignature, SECRET)).toBe(true);
    expect(verifyHmac(orderId, paymentId, 'invalid_signature_hex', SECRET)).toBe(false);
  });

  it('validates legal order fulfillment state transitions', () => {
    const allowedTransitions: Record<string, string[]> = {
      unfulfilled: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['refunded'],
      cancelled: [],
    };

    function canTransition(current: string, next: string): boolean {
      return (allowedTransitions[current] || []).includes(next);
    }

    expect(canTransition('unfulfilled', 'processing')).toBe(true);
    expect(canTransition('processing', 'packed')).toBe(true);
    expect(canTransition('packed', 'shipped')).toBe(true);
    expect(canTransition('shipped', 'delivered')).toBe(true);
    expect(canTransition('unfulfilled', 'delivered')).toBe(false); // Illegal jump
    expect(canTransition('delivered', 'processing')).toBe(false); // Illegal reversal
  });
});
