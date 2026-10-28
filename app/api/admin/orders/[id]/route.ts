import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getOrderByNumber, updateOrderStatus } from '@/lib/services/order.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffOrAdmin();
    const { id } = await params;
    const order = await getOrderByNumber(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStaffOrAdmin();
    const { id } = await params;
    const body = await request.json();

    const updated = await updateOrderStatus(id, body, session);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Status update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
