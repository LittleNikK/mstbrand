import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface FeaturedDropProps {
  products: Product[];
}

export default function FeaturedDrop({ products }: FeaturedDropProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-[#FAF7F2] border-b border-[#E8E2D8]">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D] mb-1">
              <span>Just Dropped</span>
            </div>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl text-[#1A1816]">
              Official MST Merch & Builder Gear
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center gap-1.5 group"
          >
            <span>View All ({products.length}+ Available)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
