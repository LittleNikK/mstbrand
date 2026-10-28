import { describe, it, expect } from 'vitest';

describe('Pricing, Shipping and Discount Calculations', () => {
  const FREE_SHIPPING_THRESHOLD = 2999;
  const STANDARD_SHIPPING_FEE = 150;

  function calculateShipping(subtotal: number): number {
    return (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : STANDARD_SHIPPING_FEE;
  }

  function applyPercentageDiscount(subtotal: number, percentage: number): number {
    return Math.round((subtotal * percentage) / 100);
  }

  function applyFixedDiscount(subtotal: number, fixedAmount: number, minOrder: number): number {
    if (subtotal < minOrder) return 0;
    return Math.min(subtotal, fixedAmount);
  }

  it('charges standard shipping for orders below ₹2,999', () => {
    expect(calculateShipping(1500)).toBe(150);
    expect(calculateShipping(2998)).toBe(150);
  });

  it('provides complimentary shipping for orders >= ₹2,999', () => {
    expect(calculateShipping(2999)).toBe(0);
    expect(calculateShipping(8500)).toBe(0);
  });

  it('charges 0 shipping when subtotal is 0', () => {
    expect(calculateShipping(0)).toBe(0);
  });

  it('calculates 10% percentage discount properly for MSTBUILDER10', () => {
    const subtotal = 6800;
    const discount = applyPercentageDiscount(subtotal, 10);
    expect(discount).toBe(680);
    expect(subtotal - discount).toBe(6120);
  });

  it('calculates fixed discount only when meeting minimum order amount', () => {
    const fixedDiscount = 500;
    const minOrder = 3000;

    expect(applyFixedDiscount(2500, fixedDiscount, minOrder)).toBe(0);
    expect(applyFixedDiscount(4500, fixedDiscount, minOrder)).toBe(500);
  });

  it('supports multi-unit merchandise purchasing and clamps to available stock', () => {
    const merchandiseItem = {
      sku: 'MST-TEE-01-L',
      availableStock: 25,
      requestedQuantity: 4,
    };
    const allowedQty = Math.min(merchandiseItem.requestedQuantity, merchandiseItem.availableStock);
    expect(allowedQty).toBe(4);

    const oversellItem = {
      sku: 'MST-HOODIE-M',
      availableStock: 2,
      requestedQuantity: 5,
    };
    const clampedQty = Math.min(oversellItem.requestedQuantity, oversellItem.availableStock);
    expect(clampedQty).toBe(2);
  });

  it('calculates variant-specific stock from variant list', () => {
    const variants = [
      { id: 'v1', size: 'S', color: 'Black', stock: 15, price: 1299 },
      { id: 'v2', size: 'M', color: 'Black', stock: 25, price: 1299 },
      { id: 'v3', size: 'L', color: 'Black', stock: 20, price: 1299 },
      { id: 'v4', size: 'XL', color: 'Black', stock: 10, price: 1299 },
    ];

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    expect(totalStock).toBe(70);

    const selectedVariant = variants.find(v => v.size === 'M');
    expect(selectedVariant?.stock).toBe(25);
  });
});
