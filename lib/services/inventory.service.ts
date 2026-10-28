import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export interface ReservationItem {
  productId: string;
  name: string;
  quantity: number;
}

export async function reserveStock(
  items: ReservationItem[],
  orderNumber: string
): Promise<{ success: boolean; failedItem?: ReservationItem }> {
  const db = await getDb();
  const reservedItems: ReservationItem[] = [];

  for (const item of items) {
    if (!ObjectId.isValid(item.productId)) {
      await rollbackReservations(reservedItems, orderNumber);
      return { success: false, failedItem: item };
    }

    const result = await db.collection('products').updateOne(
      {
        _id: new ObjectId(item.productId),
        stock: { $gte: item.quantity },
        status: 'published',
      },
      {
        $inc: { stock: -item.quantity },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    if (result.modifiedCount === 0) {
      // Stock is exhausted or item already purchased by another concurrent customer
      await rollbackReservations(reservedItems, orderNumber);
      return { success: false, failedItem: item };
    }

    reservedItems.push(item);

    // Record movement
    await db.collection('inventory_movements').insertOne({
      productId: item.productId,
      productName: item.name,
      delta: -item.quantity,
      type: 'order_reservation',
      referenceId: orderNumber,
      reason: `Stock reserved for order ${orderNumber}`,
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true };
}

export async function rollbackReservations(
  items: ReservationItem[],
  orderNumber: string
): Promise<void> {
  const db = await getDb();

  for (const item of items) {
    if (!ObjectId.isValid(item.productId)) continue;

    await db.collection('products').updateOne(
      { _id: new ObjectId(item.productId) },
      {
        $inc: { stock: item.quantity },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    await db.collection('inventory_movements').insertOne({
      productId: item.productId,
      productName: item.name,
      delta: item.quantity,
      type: 'order_cancelled',
      referenceId: orderNumber,
      reason: `Reservation rolled back for order ${orderNumber}`,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function restockOrder(orderNumber: string): Promise<void> {
  const db = await getDb();
  const order = await db.collection('orders').findOne({ orderNumber });
  if (!order || !order.items) return;

  for (const item of order.items) {
    if (!ObjectId.isValid(item.productId)) continue;

    await db.collection('products').updateOne(
      { _id: new ObjectId(item.productId) },
      {
        $inc: { stock: item.quantity },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    await db.collection('inventory_movements').insertOne({
      productId: item.productId,
      productName: item.name,
      delta: item.quantity,
      type: 'order_cancelled',
      referenceId: orderNumber,
      reason: `Order cancelled / refunded: stock returned to inventory for order ${orderNumber}`,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function getInventoryMovements(productId?: string, limit = 50) {
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (productId) {
    query.productId = productId;
  }

  return db.collection('inventory_movements')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
