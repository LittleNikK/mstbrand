import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function EditorialStory() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2] border-b border-[#E8E2D8] overflow-hidden">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 rounded-sm overflow-hidden border border-[#D5CCC0] shadow-xl bg-stone-200">
              <Image
                src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80"
                alt="MST Blockchain Developer Culture & Ecosystem Goodies"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-serif-editorial italic">
                “Physical gear built with the same precision as the blockchain.”
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
              <span>The Philosophy of MST Store</span>
            </div>

            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1A1816] leading-[1.15]">
              Disposable swag was made to be discarded. <br />
              <span className="italic font-normal text-[#FF2D2D]">We build gear engineered to endure.</span>
            </h2>

            <p className="text-sm text-[#5C564E] leading-relaxed">
              MST Blockchain is engineered for 50,000+ TPS and sub-second finality. The official MST Store
              brings that same relentless commitment to physical craftsmanship. In an industry flooded with
              throwaway promo tees, we craft heirloom-quality essentials.
            </p>

            <p className="text-sm text-[#5C564E] leading-relaxed">
              When you wear MST gear, you represent an uncompromising global developer ecosystem.
              Heavyweight ring-spun cotton that gets softer with every wash, double-wall vacuum drinkware
              that keeps beverages cold through 24-hour hackathons, and 100% plastic-free packaging delivered worldwide.
            </p>

            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1A1816] hover:text-[#FF2D2D] border-b border-[#1A1816] pb-1 hover:border-[#FF2D2D] transition"
              >
                <span>Explore The Official Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
