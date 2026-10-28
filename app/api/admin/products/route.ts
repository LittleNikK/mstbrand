import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createProduct, getProducts } from '@/lib/services/product.service';

export async function GET(request: Request) {
  try {
    await requireStaffOrAdmin();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || undefined;
    const q = searchParams.get('q') || undefined;

    const result = await getProducts({ page, limit, status, q });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireStaffOrAdmin();
    const body = await request.json();

    const product = await createProduct(body, session);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    let message = 'Failed to create product';
    if (error && typeof error === 'object' && 'issues' in error && Array.isArray((error as { issues: { message: string }[] }).issues)) {
      message = (error as { issues: { message: string }[] }).issues.map(i => i.message).join('; ');
    } else if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          message = parsed.map((p: { message: string }) => p.message).join('; ');
        } else {
          message = error.message;
        }
      } catch {
        message = error.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
