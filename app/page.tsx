import React from 'react';
import { getFeaturedProducts } from '@/lib/services/product.service';
import { getDb } from '@/lib/db/mongodb';
import Hero from '@/components/home/Hero';
import CollectionShowcase from '@/components/home/CollectionShowcase';
import FeaturedDrop from '@/components/home/FeaturedDrop';
import ConditionStandards from '@/components/home/ConditionStandards';
import EditorialStory from '@/components/home/EditorialStory';
import DatabaseEmptyNotice from '@/components/home/DatabaseEmptyNotice';
import { Collection, Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let collections: Collection[] = [];
  let dbError: string | null = null;

  try {
    featuredProducts = await getFeaturedProducts(8);

    const db = await getDb();
    const rawCollections = await db.collection('collections')
      .find({})
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    collections = rawCollections.map(c => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      featured: Boolean(c.featured),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  } catch (err: unknown) {
    const e = err as Error;
    console.error('HomePage database query error:', e);
    dbError = e?.message || 'Database connection error';
  }

  const needsSeeding = (featuredProducts.length === 0 && collections.length === 0) || Boolean(dbError);

  return (
    <main className="min-h-screen">
      <Hero />
      {needsSeeding && (
        <DatabaseEmptyNotice error={dbError} />
      )}
      <CollectionShowcase collections={collections} />
      <FeaturedDrop products={featuredProducts} />
      <ConditionStandards />
      <EditorialStory />
    </main>
  );
}
