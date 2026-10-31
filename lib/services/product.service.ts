import { ObjectId, Filter } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { Product, UserSession } from '@/types';
import { productSchema } from '@/lib/validations/product';
import { z } from 'zod';

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  category?: string;
  collection?: string;
  condition?: string;
  size?: string;
  color?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
  q?: string;
  inStockOnly?: boolean;
  status?: string;
}

function mapProduct(doc: Record<string, unknown>): Product {
  const { _id, ...rest } = doc;
  const sellingPrice = Number(rest.sellingPrice) || 0;
  const costPrice = typeof rest.costPrice === 'number' ? rest.costPrice : (rest.costPrice ? Number(rest.costPrice) : undefined);
  let referencePrice = typeof rest.referencePrice === 'number' ? rest.referencePrice : (rest.referencePrice ? Number(rest.referencePrice) : undefined);

  // If referencePrice is missing or less than/equal to sellingPrice, but costPrice was entered higher than sellingPrice,
  // the admin intended costPrice as the original MRP / reference price
  if ((!referencePrice || referencePrice <= sellingPrice) && costPrice && costPrice > sellingPrice) {
    referencePrice = costPrice;
  }

  return {
    _id: _id instanceof ObjectId ? _id.toString() : String(_id),
    imageFit: (rest.imageFit as 'contain' | 'cover') || 'contain',
    ...rest,
    sellingPrice,
    costPrice,
    referencePrice,
  } as Product;
}

export async function getProducts(filters: ProductQueryFilters = {}) {
  const db = await getDb();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Filter<any> = {};

  // Status filter (default to published for public store, omit when 'all' is specified)
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  } else if (!filters.status && filters.status !== 'all') {
    query.status = 'published';
  }

  if (filters.inStockOnly) {
    query.stock = { $gt: 0 };
  }

  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  if (filters.collection) {
    query.collectionIds = filters.collection;
  }

  if (filters.condition) {
    query.conditionGrade = filters.condition;
  }

  if (filters.size) {
    query.$or = [
      { standardSize: filters.size },
      { sizes: filters.size },
      { 'variants.size': filters.size },
    ];
  }

  if (filters.color) {
    query.$or = [
      { color: { $regex: new RegExp(`^${filters.color}$`, 'i') } },
      { colors: { $regex: new RegExp(`^${filters.color}$`, 'i') } },
      { 'variants.color': { $regex: new RegExp(`^${filters.color}$`, 'i') } },
    ];
  }

  if (filters.brand) {
    query.brand = { $regex: new RegExp(`^${filters.brand}$`, 'i') };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.sellingPrice = {};
    if (filters.minPrice !== undefined) query.sellingPrice.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.sellingPrice.$lte = filters.maxPrice;
  }

  if (filters.q && filters.q.trim()) {
    const searchRegex = new RegExp(filters.q.trim(), 'i');
    query.$or = [
      { name: { $regex: searchRegex } },
      { brand: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { sku: { $regex: searchRegex } },
      { tags: { $regex: searchRegex } },
      { material: { $regex: searchRegex } },
    ];
  }

  // Sorting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: any = { createdAt: -1 };
  if (filters.sort === 'price-asc') {
    sortOption = { sellingPrice: 1 };
  } else if (filters.sort === 'price-desc') {
    sortOption = { sellingPrice: -1 };
  } else if (filters.sort === 'featured') {
    sortOption = { isFeatured: -1, createdAt: -1 };
  }

  const [items, totalCount] = await Promise.all([
    db.collection('products')
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('products').countDocuments(query),
  ]);

  return {
    products: items.map(mapProduct),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await getDb();
  const doc = await db.collection('products').findOne({ slug, status: 'published' });
  if (!doc) return null;
  return mapProduct(doc);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  const doc = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return mapProduct(doc);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const db = await getDb();
    const docs = await db.collection('products')
      .find({ status: 'published', isFeatured: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map(mapProduct);
  } catch (err) {
    console.warn('Failed to fetch featured products:', err);
    return [];
  }
}

export async function getRelatedProducts(productId: string, category: string, limit = 4): Promise<Product[]> {
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    status: 'published',
    category,
    stock: { $gt: 0 },
  };
  if (ObjectId.isValid(productId)) {
    query._id = { $ne: new ObjectId(productId) };
  }

  const docs = await db.collection('products')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(mapProduct);
}

export async function createProduct(input: z.infer<typeof productSchema>, user: UserSession): Promise<Product> {
  const db = await getDb();
  const validated = productSchema.parse(input);

  // Check unique slug
  const existing = await db.collection('products').findOne({ slug: validated.slug });
  if (existing) {
    throw new Error(`Product slug "${validated.slug}" already exists`);
  }

  const now = new Date().toISOString();
  const docToInsert = {
    ...validated,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('products').insertOne(docToInsert);

  // Record inventory movement
  await db.collection('inventory_movements').insertOne({
    productId: result.insertedId.toString(),
    productName: validated.name,
    delta: validated.stock,
    previousStock: 0,
    newStock: validated.stock,
    type: 'initial',
    reason: 'Initial merchandise product stock creation',
    createdAt: now,
  });

  // Audit log
  await db.collection('audit_logs').insertOne({
    userId: user.userId,
    userEmail: user.email,
    action: 'CREATE_PRODUCT',
    entity: 'product',
    entityId: result.insertedId.toString(),
    details: { name: validated.name, slug: validated.slug },
    createdAt: now,
  });

  return {
    _id: result.insertedId.toString(),
    ...docToInsert,
  } as Product;
}

export async function updateProduct(
  id: string,
  input: Partial<z.infer<typeof productSchema>>,
  user: UserSession
): Promise<Product | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;

  const current = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!current) return null;

  const now = new Date().toISOString();
  // If slug changed, ensure unique
  if (input.slug && input.slug !== current.slug) {
    const existing = await db.collection('products').findOne({ slug: input.slug, _id: { $ne: new ObjectId(id) } });
    if (existing) {
      throw new Error(`Product slug "${input.slug}" already exists`);
    }
  }

  // Check stock change
  if (input.stock !== undefined && input.stock !== current.stock) {
    const delta = input.stock - (current.stock || 0);
    await db.collection('inventory_movements').insertOne({
      productId: id,
      productName: current.name,
      delta,
      previousStock: current.stock || 0,
      newStock: input.stock,
      type: 'admin_adjustment',
      reason: 'Manual stock update from admin panel',
      createdAt: now,
    });
  }

  const updatedDoc = {
    ...input,
    updatedAt: now,
  };
  // Ensure _id is never present in $set to avoid MongoServerError: immutable field
  delete (updatedDoc as Record<string, unknown>)._id;

  await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedDoc }
  );

  await db.collection('audit_logs').insertOne({
    userId: user.userId,
    userEmail: user.email,
    action: 'UPDATE_PRODUCT',
    entity: 'product',
    entityId: id,
    details: input,
    createdAt: now,
  });

  const refreshed = await db.collection('products').findOne({ _id: new ObjectId(id) });
  return refreshed ? mapProduct(refreshed) : null;
}

export async function deleteProduct(id: string, user: UserSession): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;

  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!product) return false;

  await db.collection('products').deleteOne({ _id: new ObjectId(id) });

  await db.collection('audit_logs').insertOne({
    userId: user.userId,
    userEmail: user.email,
    action: 'DELETE_PRODUCT',
    entity: 'product',
    entityId: id,
    details: { name: product.name, slug: product.slug },
    createdAt: new Date().toISOString(),
  });

  return true;
}
