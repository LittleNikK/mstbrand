import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    await requireStaffOrAdmin();
    const db = await getDb();
    const discounts = await db.collection('discount_codes').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      discounts: discounts.map(d => ({
        _id: d._id.toString(),
        code: d.code,
        type: d.type,
        value: d.value,
        minOrderAmount: d.minOrderAmount || 0,
        maxUses: d.maxUses || 0,
        usedCount: d.usedCount || 0,
        expiresAt: d.expiresAt,
        isActive: d.isActive,
        createdAt: d.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireStaffOrAdmin();
    const body = await request.json();
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Missing required discount fields' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const db = await getDb();

    const existing = await db.collection('discount_codes').findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: 'A discount code with this name already exists' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const insertResult = await db.collection('discount_codes').insertOne({
      code: cleanCode,
      type: type === 'percentage' ? 'percentage' : 'fixed',
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: Number(maxUses) || 0,
      usedCount: 0,
      expiresAt: expiresAt || undefined,
      isActive: true,
      createdAt: now,
    });

    await db.collection('audit_logs').insertOne({
      userId: session.userId,
      userEmail: session.email,
      action: 'CREATE_DISCOUNT_CODE',
      entity: 'discount_code',
      entityId: insertResult.insertedId.toString(),
      details: { code: cleanCode, value, type },
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      discount: {
        _id: insertResult.insertedId.toString(),
        code: cleanCode,
        type,
        value,
        isActive: true,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create discount';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireStaffOrAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('discount_codes').deleteOne({ _id: new ObjectId(id) });

    await db.collection('audit_logs').insertOne({
      userId: session.userId,
      userEmail: session.email,
      action: 'DELETE_DISCOUNT_CODE',
      entity: 'discount_code',
      entityId: id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Discount deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
