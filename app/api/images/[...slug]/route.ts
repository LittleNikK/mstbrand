import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const id = slug?.[0];

    if (!id || !ObjectId.isValid(id)) {
      return new NextResponse('Invalid image identifier', { status: 400 });
    }

    const db = await getDb();
    const media = await db.collection('media').findOne({ _id: new ObjectId(id) });

    if (!media || !media.data) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Convert BSON Binary or Buffer to standard Node Buffer
    const buffer = Buffer.isBuffer(media.data)
      ? media.data
      : media.data.buffer
      ? Buffer.from(media.data.buffer)
      : Buffer.from(media.data);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': media.contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching image from database:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
