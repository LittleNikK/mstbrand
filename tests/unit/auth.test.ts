import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSessionToken, verifySessionToken } from '@/lib/auth/jwt';

describe('Authentication & Security', () => {
  it('hashes passwords and verifies correctly', async () => {
    const raw = 'SuperSecurePass123!';
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('signs and verifies JWT session tokens with role data', async () => {
    const payload = {
      userId: '60d5ecb8b5c9c82b94e1d123',
      email: 'admin@mststore.com',
      name: 'MST Store Admin',
      role: 'admin' as const,
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe('admin');
  });

  it('rejects tampered JWT tokens safely', async () => {
    const payload = {
      userId: 'user_123',
      email: 'test@example.com',
      name: 'Test',
      role: 'customer' as const,
    };

    const token = await createSessionToken(payload);
    const tampered = token.slice(0, -6) + 'abc123';

    const verified = await verifySessionToken(tampered);
    expect(verified).toBeNull();
  });
});
