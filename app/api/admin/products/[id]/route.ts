import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStaffOrAdmin } from '@/lib/auth/session';
import { updateProduct, deleteProduct, getProductById } from '@/lib/services/product.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffOrAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStaffOrAdmin();
    const { id } = await params;
    const body = await request.json();

    const updated = await updateProduct(id, body, session);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Immediately purge Next.js server caches for storefront and admin views
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      revalidatePath(`/admin/products/${id}`);
      if (updated.slug) {
        revalidatePath(`/product/${updated.slug}`);
      }
    } catch (cacheErr) {
      console.warn('Revalidate cache warning:', cacheErr);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStaffOrAdmin();
    const { id } = await params;

    const success = await deleteProduct(id, session);
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Immediately purge Next.js server caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
    } catch (cacheErr) {
      console.warn('Revalidate cache warning:', cacheErr);
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
