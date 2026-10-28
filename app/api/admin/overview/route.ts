import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    await requireStaffOrAdmin();
    const db = await getDb();

    // 1. Order analytics
    const orders = await db.collection('orders').find({}).toArray();
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 2. Inventory stats
    const totalProducts = await db.collection('products').countDocuments({});
    const lowStockProducts = await db.collection('products').countDocuments({ stock: { $lte: 1, $gt: 0 } });
    const soldOutProducts = await db.collection('products').countDocuments({ stock: { $lte: 0 } });

    // 3. Recent 5 orders
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // 4. Customers count
    const totalCustomers = await db.collection('users').countDocuments({ role: 'customer' });
    const totalSubscribers = await db.collection('newsletter_subscribers').countDocuments({ active: true });

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        paidOrdersCount: paidOrders.length,
        averageOrderValue,
        totalProducts,
        lowStockProducts,
        soldOutProducts,
        totalCustomers,
        totalSubscribers,
      },
      recentOrders: recentOrders.map(o => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        customerName: o.customer?.name || 'Guest',
        customerEmail: o.customer?.email || '',
        total: o.total,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
