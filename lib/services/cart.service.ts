import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { Cart, CartItem, DiscountCode } from '@/types';
import { env } from '@/lib/config/env';

export interface CartCalculationResult {
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  hasUnavailableItems: boolean;
  unavailableMessage?: string;
}

export async function calculateCart(
  rawItems: {
    productId: string;
    quantity: number;
    selectedVariantId?: string;
    selectedSize?: string;
    selectedColor?: string;
  }[],
  discountCodeStr?: string
): Promise<CartCalculationResult> {
  const db = await getDb();
  const validatedItems: CartItem[] = [];
  let subtotal = 0;
  let hasUnavailableItems = false;
  let unavailableMessage = '';

  for (const raw of rawItems) {
    if (!ObjectId.isValid(raw.productId)) continue;

    const product = await db.collection('products').findOne({
      _id: new ObjectId(raw.productId),
      status: 'published',
    });

    if (!product) {
      hasUnavailableItems = true;
      unavailableMessage = 'One or more items in your bag are no longer available.';
      continue;
    }

    let availableStock = product.stock || 0;
    let itemPrice = product.sellingPrice;
    let sku = product.sku;

    // Check variant stock and price if a variant is selected
    if (raw.selectedVariantId && Array.isArray(product.variants)) {
      const variant = product.variants.find((v: { id: string }) => v.id === raw.selectedVariantId);
      if (variant) {
        availableStock = variant.stock;
        if (variant.price) itemPrice = variant.price;
        if (variant.sku) sku = variant.sku;
      }
    }

    if (availableStock <= 0) {
      hasUnavailableItems = true;
      unavailableMessage = `"${product.name}" is currently out of stock.`;
      continue;
    }

    // Only 1-of-1 pieces are restricted to 1
    const allowedQty = product.isOneOfOne
      ? 1
      : Math.max(1, Math.min(raw.quantity, availableStock));

    subtotal += itemPrice * allowedQty;

    validatedItems.push({
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      brand: product.brand || 'MST Blockchain',
      price: itemPrice,
      image: product.images?.[0]?.url || '/placeholder.png',
      quantity: allowedQty,
      maxStock: availableStock,
      sku,
      selectedVariantId: raw.selectedVariantId,
      selectedSize: raw.selectedSize || product.sizeLabel,
      selectedColor: raw.selectedColor || product.color,
      // Backward-compatible fields
      sizeLabel: raw.selectedSize || product.sizeLabel || 'Standard',
      conditionGrade: product.conditionGrade || 'Official Merch',
      isOneOfOne: Boolean(product.isOneOfOne),
    });
  }

  // Calculate discount
  let discountAmount = 0;
  let appliedCode: string | undefined = undefined;

  if (discountCodeStr && discountCodeStr.trim()) {
    const cleanCode = discountCodeStr.trim().toUpperCase();
    const discountDoc = await db.collection('discount_codes').findOne({
      code: cleanCode,
      isActive: true,
    }) as unknown as DiscountCode | null;

    if (discountDoc) {
      const isExpired = discountDoc.expiresAt && new Date(discountDoc.expiresAt) < new Date();
      const hasUsesLeft = discountDoc.maxUses === 0 || discountDoc.usedCount < discountDoc.maxUses;
      const meetsMinOrder = !discountDoc.minOrderAmount || subtotal >= discountDoc.minOrderAmount;

      if (!isExpired && hasUsesLeft && meetsMinOrder) {
        appliedCode = cleanCode;
        if (discountDoc.type === 'percentage') {
          discountAmount = Math.round((subtotal * discountDoc.value) / 100);
        } else {
          discountAmount = Math.min(subtotal, discountDoc.value);
        }
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  // Free shipping above threshold
  const shippingFee = (subtotal === 0 || discountedSubtotal >= env.FREE_SHIPPING_THRESHOLD)
    ? 0
    : env.DEFAULT_SHIPPING_FEE;

  // Taxes are inclusive in retail price per Indian GST standards
  const taxAmount = 0;
  const total = discountedSubtotal + shippingFee;

  return {
    items: validatedItems,
    subtotal,
    discountCode: appliedCode,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    hasUnavailableItems,
    unavailableMessage: hasUnavailableItems ? unavailableMessage : undefined,
  };
}

export async function getCartForUserOrGuest(userId?: string, guestId?: string): Promise<Cart | null> {
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (userId) {
    query.userId = userId;
  } else if (guestId) {
    query.guestId = guestId;
  } else {
    return null;
  }

  const cartDoc = await db.collection('carts').findOne(query);
  if (!cartDoc) return null;

  // Recalculate directly to ensure current prices and availability
  const calc = await calculateCart(cartDoc.items || [], cartDoc.discountCode);
  return {
    _id: cartDoc._id.toString(),
    userId: cartDoc.userId,
    guestId: cartDoc.guestId,
    items: calc.items,
    discountCode: calc.discountCode,
    discountAmount: calc.discountAmount,
    subtotal: calc.subtotal,
    shippingFee: calc.shippingFee,
    total: calc.total,
    updatedAt: cartDoc.updatedAt || new Date().toISOString(),
  };
}

export async function saveCart(
  items: {
    productId: string;
    quantity: number;
    selectedVariantId?: string;
    selectedSize?: string;
    selectedColor?: string;
  }[],
  userId?: string,
  guestId?: string,
  discountCode?: string
): Promise<Cart> {
  const db = await getDb();
  const calc = await calculateCart(items, discountCode);
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = userId ? { userId } : { guestId };
  const updateData = {
    userId,
    guestId: userId ? undefined : guestId,
    items: calc.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      selectedVariantId: item.selectedVariantId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    })),
    discountCode: calc.discountCode,
    updatedAt: now,
  };

  const result = await db.collection('carts').findOneAndUpdate(
    query,
    { $set: updateData },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    _id: result?._id?.toString(),
    userId,
    guestId,
    items: calc.items,
    discountCode: calc.discountCode,
    discountAmount: calc.discountAmount,
    subtotal: calc.subtotal,
    shippingFee: calc.shippingFee,
    total: calc.total,
    updatedAt: now,
  };
}

export async function mergeGuestCartIntoUserCart(guestId: string, userId: string): Promise<void> {
  const db = await getDb();
  const guestCart = await db.collection('carts').findOne({ guestId });
  if (!guestCart || !guestCart.items || guestCart.items.length === 0) return;

  const userCart = await db.collection('carts').findOne({ userId });
  // Key by productId + selectedVariantId to handle variant lines correctly
  const mergedItemsMap = new Map<string, {
    productId: string;
    quantity: number;
    selectedVariantId?: string;
    selectedSize?: string;
    selectedColor?: string;
  }>();

  if (userCart && userCart.items) {
    for (const item of userCart.items) {
      const key = `${item.productId}_${item.selectedVariantId || ''}`;
      mergedItemsMap.set(key, { ...item });
    }
  }

  for (const item of guestCart.items) {
    const key = `${item.productId}_${item.selectedVariantId || ''}`;
    const existing = mergedItemsMap.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      mergedItemsMap.set(key, { ...item });
    }
  }

  const mergedItems = Array.from(mergedItemsMap.values());

  await saveCart(mergedItems, userId, undefined, userCart?.discountCode || guestCart.discountCode);
  await db.collection('carts').deleteOne({ guestId });
}
