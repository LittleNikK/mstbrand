import { z } from 'zod';

export const conditionGradeEnum = z.enum([
  'Official Merch',
  'Limited Edition',
  'Mint',
  'New with tags',
  'Excellent',
  'Very good',
  'Good',
  'Fair',
]);

export const productCategoryEnum = z.enum([
  'apparel',
  'headwear',
  'drinkware',
  'tech-accessories',
  'goodies',
  'bags',
  'bundles',
  'stationery',
  'collectibles',
  // Legacy categories for backwards compatibility
  'vintage-tees',
  'shirts',
  'denim',
  'jackets',
  'sweatshirts',
  'trousers',
  'dresses',
  'accessories',
  'archive',
]);

export const standardSizeEnum = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS']);

export const variantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().optional(),
  name: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  price: z.number().positive().optional(),
});

export const specificationItemSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const specificationObjectSchema = z.object({
  material: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  careInstructions: z.string().optional(),
  origin: z.string().optional(),
  features: z.array(z.string()).optional(),
  compatibility: z.string().optional(),
}).passthrough();

export const specificationSchema = z.union([
  specificationObjectSchema,
  z.array(specificationItemSchema),
]);

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(150),
  slug: z.string().min(1, 'Slug is required').max(150),
  sku: z.string().optional(),
  description: z.string().optional().default('Official MST Blockchain merchandise.'),
  category: productCategoryEnum,
  brand: z.string().min(1, 'Brand is required').default('MST Blockchain'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be 0 or more').default(0),
  referencePrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(10),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  isFeatured: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  editionNumber: z.string().optional(),
  imageFit: z.enum(['contain', 'cover']).default('contain').optional(),
  images: z.array(z.object({
    url: z.string().min(1, 'Image path or URL is required'),
    alt: z.string().optional().default('Product photo'),
    isPrimary: z.boolean().default(false),
    publicId: z.string().optional(),
    fit: z.enum(['contain', 'cover']).default('contain').optional(),
  })).default([
    {
      url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      alt: 'Front View',
      isPrimary: true,
    },
  ]),
  collectionIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
  specifications: specificationSchema.optional(),
  // Optional legacy clothing fields for backward compatibility
  sizeLabel: z.string().optional().default('Standard'),
  standardSize: standardSizeEnum.optional(),
  measurements: z.record(z.string(), z.string().optional()).default({}),
  color: z.string().optional(),
  material: z.string().optional(),
  conditionGrade: z.string().optional().default('Official Merch'),
  conditionNotes: z.string().optional().default(''),
  flaws: z.array(z.string()).default([]),
  isOneOfOne: z.boolean().default(false),
  provenanceNotes: z.string().optional(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  category: z.string().optional(),
  collection: z.string().optional(),
  condition: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'featured']).default('newest'),
  q: z.string().optional(),
  inStockOnly: z.enum(['true', 'false']).optional(),
});
