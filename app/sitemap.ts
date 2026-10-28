import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  const db = await getDb();
  const products = await db.collection('products')
    .find({ status: 'published' }, { projection: { slug: 1, updatedAt: 1 } })
    .toArray();

  const productUrls: MetadataRoute.Sitemap = products.map(p => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.updatedAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  return [...staticUrls, ...productUrls];
}
