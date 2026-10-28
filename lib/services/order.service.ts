import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { Order, OrderPaymentStatus, OrderFulfillmentStatus, UserSession } from '@/types';
import { calculateCart } from './cart.service';
import { reserveStock, restockOrder } from './inventory.service';
import { sendOrderConfirmationAsync } from './email.service';
import { checkoutSchema } from '@/lib/validations/checkout';
import { z } from 'zod';

function mapOrder(doc: Record<string, unknown>): Order {
  const { _id, ...rest } = doc;
  return {
    _id: _id instanceof ObjectId ? _id.toString() : String(_id),
    ...rest,
  } as Order;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timestampPart = Date.now().toString().slice(-4);
  return `MST-${year}-${randomSuffix}${timestampPart}`;
}

export async function createOrder(
  input: z.infer<typeof checkoutSchema>,
  cartItems: {
    productId: string;
    quantity: number;
    selectedVariantId?: string;
    selectedSize?: string;
    selectedColor?: string;
  }[],
  userId?: string
): Promise<{ order: Order; razorpayOrderInfo?: Record<string, unknown> }> {
  const db = await getDb();
  const validated = checkoutSchema.parse(input);

  // 1. Recalculate totals directly from database to guarantee authentic prices and stock
  const cartCalc = await calculateCart(cartItems, validated.discountCode);

  if (cartCalc.items.length === 0) {
    throw new Error('Your cart is empty or the items are no longer available.');
  }

  if (cartCalc.hasUnavailableItems) {
    throw new Error(cartCalc.unavailableMessage || 'Some items in your cart are no longer available.');
  }

  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  // 2. Concurrency-safe atomic inventory reservation
  const reservationResult = await reserveStock(
    cartCalc.items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
    })),
    orderNumber
  );

  if (!reservationResult.success) {
    throw new Error(
      `Oversell protection: "${reservationResult.failedItem?.name}" was just claimed by another customer. Please review your bag.`
    );
  }

  // 3. Prepare Order Document
  const orderDoc = {
    orderNumber,
    userId: userId || undefined,
    customer: validated.customer,
    shippingAddress: validated.shippingAddress,
    items: cartCalc.items.map(item => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      sizeLabel: item.sizeLabel || 'Standard',
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      sku: item.sku,
      selectedVariantId: item.selectedVariantId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      // Backward compatibility fields
      conditionGrade: item.conditionGrade,
      isOneOfOne: item.isOneOfOne,
    })),
    subtotal: cartCalc.subtotal,
    discountAmount: cartCalc.discountAmount,
    discountCode: cartCalc.discountCode,
    shippingFee: cartCalc.shippingFee,
    taxAmount: cartCalc.taxAmount,
    total: cartCalc.total,
    paymentStatus: 'pending' as OrderPaymentStatus,
    paymentMethod: validated.paymentMethod,
    fulfillmentStatus: 'unfulfilled' as OrderFulfillmentStatus,
    timeline: [
      {
        status: 'Order Placed',
        timestamp: now,
        note: `Order initiated with ${validated.paymentMethod.toUpperCase()}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const insertResult = await db.collection('orders').insertOne(orderDoc);

  // If discount code was used, increment usage count
  if (cartCalc.discountCode) {
    await db.collection('discount_codes').updateOne(
      { code: cartCalc.discountCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // Clear cart for the user
  if (userId) {
    await db.collection('carts').deleteOne({ userId });
  }

  const createdOrder = {
    _id: insertResult.insertedId.toString(),
    ...orderDoc,
  } as Order;

  return { order: createdOrder };
}

export async function markOrderPaid(
  orderNumber: string,
  paymentDetails: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    provider?: string;
  }
): Promise<Order | null> {
  const db = await getDb();
  const order = await db.collection('orders').findOne({ orderNumber });
  if (!order) return null;

  // Idempotency: if already paid, avoid duplicate updates
  if (order.paymentStatus === 'paid') {
    return mapOrder(order);
  }

  const now = new Date().toISOString();
  const updateData = {
    paymentStatus: 'paid' as OrderPaymentStatus,
    fulfillmentStatus: 'processing' as OrderFulfillmentStatus,
    paymentDetails: {
      ...paymentDetails,
      paidAt: now,
    },
    updatedAt: now,
  };

  await db.collection('orders').updateOne(
    { orderNumber },
    {
      $set: updateData,
      $push: {
        timeline: {
          status: 'Payment Confirmed',
          timestamp: now,
          note: `Payment verified successfully via ${paymentDetails.provider || 'gateway'}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
    }
  );

  const updatedOrder = await db.collection('orders').findOne({ orderNumber });
  if (updatedOrder) {
    const mapped = mapOrder(updatedOrder);
    sendOrderConfirmationAsync(mapped);
    return mapped;
  }

  return null;
}

export async function updateOrderStatus(
  orderNumber: string,
  updates: {
    fulfillmentStatus?: OrderFulfillmentStatus;
    paymentStatus?: OrderPaymentStatus;
    tracking?: { carrier: string; trackingNumber: string; trackingUrl?: string };
    note?: string;
  },
  adminUser: UserSession
): Promise<Order | null> {
  const db = await getDb();
  const order = await db.collection('orders').findOne({ orderNumber });
  if (!order) return null;

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setDoc: any = { updatedAt: now };
  const timelineEntries = [];

  if (updates.fulfillmentStatus && updates.fulfillmentStatus !== order.fulfillmentStatus) {
    setDoc.fulfillmentStatus = updates.fulfillmentStatus;
    timelineEntries.push({
      status: `Fulfillment: ${updates.fulfillmentStatus.toUpperCase()}`,
      timestamp: now,
      note: updates.note || `Status updated by ${adminUser.email}`,
    });

    // If cancelled, restock inventory automatically
    if (updates.fulfillmentStatus === 'cancelled') {
      await restockOrder(orderNumber);
    }
  }

  if (updates.paymentStatus && updates.paymentStatus !== order.paymentStatus) {
    setDoc.paymentStatus = updates.paymentStatus;
    timelineEntries.push({
      status: `Payment: ${updates.paymentStatus.toUpperCase()}`,
      timestamp: now,
      note: updates.note || `Payment status updated by ${adminUser.email}`,
    });

    if (updates.paymentStatus === 'refunded') {
      await restockOrder(orderNumber);
    }
  }

  if (updates.tracking) {
    setDoc.tracking = updates.tracking;
    timelineEntries.push({
      status: 'Shipped with Tracking',
      timestamp: now,
      note: `Carrier: ${updates.tracking.carrier} — # ${updates.tracking.trackingNumber}`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQuery: any = { $set: setDoc };
  if (timelineEntries.length > 0) {
    updateQuery.$push = { timeline: { $each: timelineEntries } };
  }

  await db.collection('orders').updateOne({ orderNumber }, updateQuery);

  await db.collection('audit_logs').insertOne({
    userId: adminUser.userId,
    userEmail: adminUser.email,
    action: 'UPDATE_ORDER_STATUS',
    entity: 'order',
    entityId: orderNumber,
    details: updates,
    createdAt: now,
  });

  const refreshed = await db.collection('orders').findOne({ orderNumber });
  return refreshed ? mapOrder(refreshed) : null;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const db = await getDb();
  const doc = await db.collection('orders').findOne({ orderNumber });
  if (!doc) return null;
  return mapOrder(doc);
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const db = await getDb();
  const docs = await db.collection('orders')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(mapOrder);
}

export async function getAllOrders(filters: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
} = {}) {
  const db = await getDb();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (filters.status && filters.status !== 'all') {
    query.fulfillmentStatus = filters.status;
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { orderNumber: { $regex: new RegExp(s, 'i') } },
      { 'customer.name': { $regex: new RegExp(s, 'i') } },
      { 'customer.email': { $regex: new RegExp(s, 'i') } },
    ];
  }

  const [docs, totalCount] = await Promise.all([
    db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('orders').countDocuments(query),
  ]);

  return {
    orders: docs.map(mapOrder),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}
