import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ wishlist: [] });
    }

    const db = await getDb();
    const doc = await db.collection('wishlists').findOne({ userId: session.userId });
    if (!doc || !doc.productIds || doc.productIds.length === 0) {
      return NextResponse.json({ wishlist: [] });
    }

    const validObjectIds = doc.productIds
      .filter((id: string) => ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));

    const products = await db.collection('products')
      .find({ _id: { $in: validObjectIds }, status: 'published' })
      .toArray();

    const formatted = products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      brand: p.brand || 'MST Blockchain',
      category: p.category,
      sku: p.sku || '',
      sellingPrice: p.sellingPrice,
      image: p.images?.[0]?.url || '/placeholder.png',
      stock: p.stock,
      variants: p.variants || [],
    }));

    return NextResponse.json({ wishlist: formatted });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to save to your wishlist' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;
    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('wishlists').updateOne(
      { userId: session.userId },
      {
        $addToSet: { productIds: productId },
        $set: { updatedAt: new Date().toISOString() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Saved to wishlist' });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('wishlists').updateOne(
      { userId: session.userId },
      {
        $pull: { productIds: productId as unknown as undefined },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
