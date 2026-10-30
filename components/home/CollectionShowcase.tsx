import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Collection } from '@/types';

interface CollectionShowcaseProps {
  collections: Collection[];
}

export default function CollectionShowcase({ collections }: CollectionShowcaseProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <section id="collections" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-[#E8E2D8]">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
              Official Drops
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1816] mt-1">
              Explore By Collection & Gear
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center gap-1 group"
          >
            <span>View Complete Catalog</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col, index) => (
            <Link
              key={col._id}
              href={`/shop?collection=${col._id}`}
              className="group relative h-96 rounded-sm overflow-hidden border border-[#E8E2D8] flex flex-col justify-end p-6 transition-all duration-300 hover:shadow-lg hover:border-[#D5CCC0]"
            >
              <Image
                src={col.imageUrl}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover img-zoom-hover brightness-90 group-hover:brightness-75 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 text-white space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6B6B]">
                  Collection No. 0{index + 1}
                </span>
                <h3 className="font-serif-editorial text-xl font-medium text-white group-hover:text-[#FAF7F2] transition">
                  {col.name}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white group-hover:text-[#FF6B6B] transition">
                  <span>Explore Pieces</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
