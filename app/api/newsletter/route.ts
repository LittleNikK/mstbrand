import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const { email } = result.data;
    const db = await getDb();

    await db.collection('newsletter_subscribers').updateOne(
      { email: email.toLowerCase() },
      {
        $setOnInsert: {
          email: email.toLowerCase(),
          subscribedAt: new Date().toISOString(),
          active: true,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Welcome to the archive dispatch. You will receive private drop notifications.',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
