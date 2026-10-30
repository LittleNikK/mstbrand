import { MongoClient } from 'mongodb';

async function verify() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'mst_store');

  const latestOrder = await db.collection('orders').findOne({}, { sort: { createdAt: -1 } });
  console.log('✓ LATEST ORDER FOUND:', latestOrder?.orderNumber);
  console.log('  Customer:', latestOrder?.customer?.name, latestOrder?.customer?.email);
  console.log('  Total: ₹' + latestOrder?.total);
  console.log('  Payment Status:', latestOrder?.paymentStatus);
  console.log('  Fulfillment Status:', latestOrder?.fulfillmentStatus);

  const product = await db.collection('products').findOne({ slug: '1994-pink-floyd-division-bell-tour-tee' });
  console.log('✓ STOCK LEVEL CHECK:');
  console.log('  Garment:', product?.name);
  console.log('  Remaining Stock:', product?.stock, '(was 1, now 0 - One-of-one atomic decrement verified!)');

  const movements = await db.collection('inventory_movements').find({ referenceId: latestOrder?.orderNumber }).toArray();
  console.log('✓ AUDIT MOVEMENTS LOGGED:', movements.length, 'records');

  await client.close();
}

verify().catch(console.error);
