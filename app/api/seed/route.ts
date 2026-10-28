import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { seedDatabase } from '@/scripts/seed';
import { env } from '@/lib/config/env';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Check if database is already populated
    let existingCount = 0;
    try {
      const db = await getDb();
      existingCount = await db.collection('products').countDocuments();
    } catch (connErr) {
      console.warn('Initial connection probe failed, attempting seed direct connection:', connErr);
    }

    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: true,
        alreadySeeded: true,
        message: `Database already contains ${existingCount} products. Pass ?force=true if you want to re-seed.`,
        productsCount: existingCount,
        demoAccounts: {
          admin: 'admin@mststore.com / Admin@123456',
          customer: 'customer@mststore.com / Customer@123456',
        },
      });
    }

    console.log('API seed triggered for:', env.MONGODB_URI);
    const result = await seedDatabase(env.MONGODB_URI, env.MONGODB_DB_NAME);

    return NextResponse.json({
      ...result,
      demoAccounts: {
        admin: 'admin@mststore.com / Admin@123456',
        customer: 'customer@mststore.com / Customer@123456',
      },
    });
  } catch (error: unknown) {
    console.error('API seed failed:', error);
    const errMessage = (error as { message?: string })?.message || 'Database seeding failed';
    return NextResponse.json(
      {
        success: false,
        error: errMessage,
        mongoUriPreview: env.MONGODB_URI ? env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'not set',
        hint: env.MONGODB_URI.includes('127.0.0.1')
          ? 'Your MONGODB_URI is pointing to localhost (127.0.0.1). On Vercel, you must set MONGODB_URI in Project Settings to a cloud database such as MongoDB Atlas.'
          : 'Check your database credentials and IP whitelist (allow 0.0.0.0/0 on MongoDB Atlas for Vercel serverless lambdas).',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
