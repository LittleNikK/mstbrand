import { describe, it, expect } from 'vitest';
import { productSchema } from '@/lib/validations/product';

describe('Merchandise Product Schema Validation', () => {
  it('validates a complete merchandise product with variants and specifications', () => {
    const validMerch = {
      name: 'MST Genesis Technical Hoodie',
      slug: 'mst-genesis-hoodie',
      description: 'Official heavyweight hoodie engineered for MST ecosystem developers.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sku: 'MST-HD-GEN-01',
      color: 'Matte Stealth Black',
      material: '400 GSM French Terry Cotton',
      sellingPrice: 3499,
      referencePrice: 4499,
      costPrice: 1500,
      stock: 45,
      isFeatured: true,
      status: 'published',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Technical Hoodie front',
          isPrimary: true,
        },
      ],
      specifications: [
        { name: 'Material', value: '100% Organic Heavyweight Cotton' },
        { name: 'Fit', value: 'Relaxed Drop-Shoulder' },
        { name: 'Country of Origin', value: 'India' },
      ],
      variants: [
        { id: 'v_s', sku: 'MST-HD-GEN-01-S', size: 'S', color: 'Black', stock: 10, price: 3499 },
        { id: 'v_m', sku: 'MST-HD-GEN-01-M', size: 'M', color: 'Black', stock: 20, price: 3499 },
        { id: 'v_l', sku: 'MST-HD-GEN-01-L', size: 'L', color: 'Black', stock: 15, price: 3499 },
      ],
    };

    const parsed = productSchema.safeParse(validMerch);
    expect(parsed.success).toBe(true);
  });

  it('validates simple non-apparel merchandise without size or measurements', () => {
    const mugProduct = {
      name: 'MST 4000+ TPS Ceramic Dev Mug',
      slug: 'mst-4000-tps-mug',
      description: 'Heat-resistant 350ml ceramic coffee mug.',
      category: 'drinkware',
      brand: 'MST Blockchain',
      sku: 'MST-MUG-01',
      sellingPrice: 599,
      stock: 100,
      status: 'published',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Mug',
          isPrimary: true,
        },
      ],
      specifications: [
        { name: 'Capacity', value: '350 ml' },
        { name: 'Material', value: 'Ceramic Microwave-Safe' },
      ],
    };

    const parsed = productSchema.safeParse(mugProduct);
    expect(parsed.success).toBe(true);
  });

  it('rejects product with negative selling price', () => {
    const invalidProduct = {
      name: 'Invalid Price Item',
      slug: 'invalid-price-item',
      description: 'Test description with sufficient length',
      category: 'goodies',
      sellingPrice: -100,
      stock: 10,
      status: 'published',
      images: [{ url: 'https://example.com/img.jpg', alt: 'Test', isPrimary: true }],
    };

    const parsed = productSchema.safeParse(invalidProduct);
    expect(parsed.success).toBe(false);
  });
});
