import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';
import { env } from '@/lib/config/env';
import { Binary } from 'mongodb';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return null;
  }
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureStr = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    if (res.ok) {
      const data = await res.json();
      return data.secure_url || data.url || null;
    }
    console.warn('Cloudinary upload responded with error status:', res.status);
  } catch (err) {
    console.warn('Cloudinary upload attempt failed, falling back to database storage:', err);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    await requireStaffOrAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, AVIF, GIF, and SVG are permitted.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit of 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.split('/')[1]?.replace('+xml', '') || 'png';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 30);
    const filename = `${Date.now()}-${randomHex}-${sanitizedOriginal || `image.${ext}`}`;

    // 1. Try Cloudinary if environment variables are provided
    const cloudinaryUrl = await uploadToCloudinary(buffer, filename, file.type);
    if (cloudinaryUrl) {
      return NextResponse.json({
        success: true,
        url: cloudinaryUrl,
        publicId: filename,
        storage: 'cloudinary',
      });
    }

    // 2. Serverless-safe database storage (MongoDB Atlas)
    // Avoids EROFS (Read-only file system) on Vercel while persisting forever across deployments
    const db = await getDb();
    const mediaDoc = {
      filename,
      contentType: file.type || 'image/png',
      data: new Binary(buffer),
      size: buffer.length,
      createdAt: new Date(),
    };

    const result = await db.collection('media').insertOne(mediaDoc);
    const publicUrl = `/api/images/${result.insertedId}/${encodeURIComponent(filename)}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicId: result.insertedId.toString(),
      storage: 'database',
    });
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
