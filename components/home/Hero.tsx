import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-[#FAF7F2] border-b border-[#E8E2D8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12 lg:pt-14 pb-12 md:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 lg:pr-8 text-center lg:text-left pt-2 sm:pt-4 lg:pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D5CCC0] bg-white/80 backdrop-blur-xs text-[11px] font-medium tracking-widest uppercase text-[#FF2D2D]">
              <span>Genesis Drop No. 01 Now Live</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1A1816] leading-[1.08]">
              Built for builders. <br />
              <span className="italic font-normal text-[#FF2D2D]">Crafted for the ecosystem.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5C564E] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              The official merchandise and goodies storefront for MST Blockchain. Heavyweight hoodies,
              developer-grade tees, laser-etched drinkware, and ecosystem essentials engineered for
              the global Web3 community.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition flex items-center justify-center gap-2 rounded-sm shadow-md"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=apparel"
                className="w-full sm:w-auto px-8 py-4 border border-[#1A1816] text-[#1A1816] text-xs font-semibold tracking-widest uppercase hover:bg-white hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition flex items-center justify-center rounded-sm"
              >
                <span>Explore Apparel</span>
              </Link>
            </div>
          </div>

          {/* Right Asymmetrical Editorial Image Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Editorial Hero Image */}
              <div className="relative aspect-4/5 rounded-sm overflow-hidden border border-[#D5CCC0] shadow-xl bg-stone-200">
                <Image
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80"
                  alt="MST Blockchain Genesis Heavyweight Hoodie"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 bg-black/40 backdrop-blur-md rounded-xs border border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif-editorial font-medium">Genesis Heavyweight Hoodie</span>
                    <span className="text-[#FF6B6B] font-semibold">₹3,499</span>
                  </div>
                  <p className="text-[10px] text-stone-300 mt-0.5">450 GSM Organic Cotton • Embroidered MST Logo</p>
                </div>
              </div>

              {/* Overlapping Floating Polaroid Detail */}
              <div className="hidden sm:block absolute -bottom-6 -left-8 w-44 aspect-square rounded-sm overflow-hidden border-4 border-white shadow-2xl bg-white rotate-[-3deg]">
                <Image
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                  alt="MST 50K TPS Graphic Tee"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
