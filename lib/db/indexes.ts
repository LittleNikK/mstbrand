import { getDb } from './mongodb';

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  try {
    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    // Products
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { sparse: true });
    await db.collection('products').createIndex({ category: 1, status: 1 });
    await db.collection('products').createIndex({ status: 1, createdAt: -1 });
    await db.collection('products').createIndex({ status: 1, sellingPrice: 1 });
    await db.collection('products').createIndex({ status: 1, isFeatured: 1 });
    await db.collection('products').createIndex(
      { name: 'text', description: 'text', brand: 'text', material: 'text' },
      { name: 'product_text_search', weights: { name: 10, brand: 5, description: 2, material: 1 } }
    );

    // Collections
    await db.collection('collections').createIndex({ slug: 1 }, { unique: true });
    await db.collection('collections').createIndex({ featured: 1 });

    // Orders
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ paymentStatus: 1 });
    await db.collection('orders').createIndex({ fulfillmentStatus: 1 });
    await db.collection('orders').createIndex({ 'paymentDetails.razorpayOrderId': 1 });

    // Carts
    await db.collection('carts').createIndex({ userId: 1 });
    await db.collection('carts').createIndex({ guestId: 1 });

    // Wishlists
    await db.collection('wishlists').createIndex({ userId: 1 }, { unique: true });

    // Inventory movements
    await db.collection('inventory_movements').createIndex({ productId: 1, createdAt: -1 });

    // Discount codes
    await db.collection('discount_codes').createIndex({ code: 1 }, { unique: true });

    // Newsletter
    await db.collection('newsletter_subscribers').createIndex({ email: 1 }, { unique: true });

    // Audit logs
    await db.collection('audit_logs').createIndex({ createdAt: -1 });

    // Webhooks
    await db.collection('webhook_events').createIndex({ eventId: 1 }, { unique: true });

    console.log('✓ All MongoDB indexes verified successfully');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    throw error;
  }
}
