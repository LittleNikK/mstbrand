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
    <section id="collections" className="py-10 sm:py-16 md:py-24 bg-[#FAF7F2] border-b border-[#E8E2D8]">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
              Official Drops
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl text-[#1A1816] mt-1">
              Explore By Collection & Gear
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center gap-1.5 group"
          >
            <span>View Complete Catalog</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {collections.map((col, index) => (
            <Link
              key={col._id}
              href={`/shop?collection=${col._id}`}
              className="group relative flex flex-col bg-white border border-[#E8E2D8] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D5CCC0]"
            >
              {/* Image Container: Perfectly centered and contained, exactly like the Product Cards */}
              <div className="block relative aspect-3/4 overflow-hidden bg-[#F8F5F0] flex items-center justify-center">
                <div className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center">
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain object-center p-2 sm:p-3 transition-all duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Collection Number Badge */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                  <span className="bg-white/95 text-[#1A1816] border border-[#E8E2D8] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                    Drop 0{index + 1}
                  </span>
                </div>
              </div>

              {/* Content info below image */}
              <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between bg-white border-t border-[#E8E2D8]/60 space-y-2">
                <div>
                  <h3 className="font-serif-editorial text-base sm:text-lg font-medium text-[#1A1816] group-hover:text-[#FF2D2D] transition line-clamp-1">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#5C564E] line-clamp-2 leading-relaxed mt-1">
                    {col.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#1A1816] group-hover:text-[#FF2D2D] transition border-t border-[#E8E2D8]/40">
                  <span>Explore Pieces</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
