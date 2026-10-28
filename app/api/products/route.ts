import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/product.service';
import { productQuerySchema } from '@/lib/validations/product';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const parseResult = productQuerySchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { inStockOnly, ...rest } = parseResult.data;
    const result = await getProducts({
      ...rest,
      inStockOnly: inStockOnly === 'true',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
