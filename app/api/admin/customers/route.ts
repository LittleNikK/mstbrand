import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  try {
    await requireStaffOrAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (q.trim()) {
      query.$or = [
        { name: { $regex: new RegExp(q.trim(), 'i') } },
        { email: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }

    const users = await db.collection('users')
      .find(query, { projection: { passwordHash: 0, resetTokenHash: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Attach order summary for each customer
    const userEmails = users.map(u => u.email);
    const orders = await db.collection('orders')
      .find({ 'customer.email': { $in: userEmails } })
      .toArray();

    const ordersByUser = new Map<string, { count: number; spent: number }>();
    for (const o of orders) {
      const email = o.customer?.email?.toLowerCase();
      if (!email) continue;
      const prev = ordersByUser.get(email) || { count: 0, spent: 0 };
      ordersByUser.set(email, {
        count: prev.count + 1,
        spent: prev.spent + (o.paymentStatus === 'paid' ? o.total || 0 : 0),
      });
    }

    return NextResponse.json({
      customers: users.map(u => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        phone: u.phone,
        ordersCount: ordersByUser.get(u.email.toLowerCase())?.count || 0,
        totalSpent: ordersByUser.get(u.email.toLowerCase())?.spent || 0,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
