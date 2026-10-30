import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/product.service';
import ProductDetailView from '@/components/products/ProductDetailView';
import { getDb } from '@/lib/db/mongodb';
import { getServerSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found — MST Store',
    };
  }

  const primaryImage = product.images?.[0]?.url;

  return {
    title: `${product.name} — MST Store | Official Merchandise`,
    description: `${product.brand || 'MST Blockchain'} • ₹${product.sellingPrice.toLocaleString('en-IN')}. ${product.description.slice(0, 150)}...`,
    openGraph: {
      title: `${product.name} — MST Store`,
      description: `₹${product.sellingPrice.toLocaleString('en-IN')} • Official MST Blockchain Merchandise`,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [related, db, session] = await Promise.all([
    getRelatedProducts(product._id, product.category, 4),
    getDb(),
    getServerSession(),
  ]);

  const initialLikeCount = await db.collection('wishlists').countDocuments({ productIds: product._id });
  let initialIsWishlisted = false;
  if (session) {
    const userWishlist = await db.collection('wishlists').findOne({
      userId: session.userId,
      productIds: product._id,
    });
    initialIsWishlisted = !!userWishlist;
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={related}
      initialLikeCount={initialLikeCount}
      initialIsWishlisted={initialIsWishlisted}
    />
  );
}
