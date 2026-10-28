import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { env } from '@/lib/config/env';

export async function GET() {
  const isLocalhost = env.MONGODB_URI.includes('127.0.0.1') || env.MONGODB_URI.includes('localhost');
  const uriMasked = env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');

  try {
    const startTime = Date.now();
    const db = await getDb();
    
    // Quick ping to check connection
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    const [productsCount, usersCount, collectionsCount] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('collections').countDocuments(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        latencyMs,
        dbName: env.MONGODB_DB_NAME,
        uriPreview: uriMasked,
        isLocalhost,
        warning: isLocalhost && process.env.NODE_ENV === 'production'
          ? 'WARNING: You are in production but MONGODB_URI is pointing to localhost. Vercel cannot reach your local machine. Set MONGODB_URI in Vercel to a MongoDB Atlas cluster.'
          : undefined,
      },
      counts: {
        products: productsCount,
        users: usersCount,
        collections: collectionsCount,
      },
      hint: productsCount === 0
        ? 'Your database is connected but has 0 products. Visit /api/seed in your browser to populate products and demo logins.'
        : undefined,
    });
  } catch (error: unknown) {
    const errMessage = (error as { message?: string })?.message || 'Failed to connect to MongoDB';
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
          error: errMessage,
          uriPreview: uriMasked,
          isLocalhost,
          guidance: isLocalhost
            ? 'On Vercel, MONGODB_URI defaults to 127.0.0.1 because no cloud MONGODB_URI was configured in Vercel Environment Variables. Add your MongoDB Atlas connection string in Vercel Dashboard.'
            : 'If using MongoDB Atlas, make sure you whitelisted "0.0.0.0/0" in Atlas Network Access so Vercel serverless functions can connect.',
        },
      },
      { status: 503 }
    );
  }
}
