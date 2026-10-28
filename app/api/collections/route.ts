import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.collection('collections')
      .find({})
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    // Attach item count to each collection
    const counts = await db.collection('products').aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$collectionIds' },
      { $group: { _id: '$collectionIds', count: { $sum: 1 } } },
    ]).toArray();

    const countMap = new Map(counts.map(c => [c._id, c.count]));

    const formatted = collections.map(col => ({
      _id: col._id.toString(),
      name: col.name,
      slug: col.slug,
      description: col.description,
      imageUrl: col.imageUrl,
      featured: Boolean(col.featured),
      itemCount: countMap.get(col._id.toString()) || 0,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
    }));

    return NextResponse.json({ collections: formatted });
  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
