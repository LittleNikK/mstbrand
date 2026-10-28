import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getInventoryMovements } from '@/lib/services/inventory.service';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  try {
    await requireStaffOrAdmin();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const limit = Number(searchParams.get('limit')) || 50;

    const db = await getDb();
    const [movements, lowStock] = await Promise.all([
      getInventoryMovements(productId, limit),
      db.collection('products')
        .find({ status: 'published', stock: { $lte: 2 } })
        .sort({ stock: 1 })
        .limit(20)
        .toArray(),
    ]);

    return NextResponse.json({
      movements: movements.map(m => ({
        _id: m._id.toString(),
        productId: m.productId,
        productName: m.productName,
        delta: m.delta,
        type: m.type,
        reason: m.reason,
        referenceId: m.referenceId,
        createdAt: m.createdAt,
      })),
      lowStock: lowStock.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        sizeLabel: p.sizeLabel,
        stock: p.stock,
        isOneOfOne: p.isOneOfOne,
        sellingPrice: p.sellingPrice,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
