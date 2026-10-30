import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-[#FAF7F2] border-b border-[#E8E2D8] overflow-hidden">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 pt-4 sm:pt-6 md:pt-7 lg:pt-8 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:pr-8 text-center lg:text-left">
           
            <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.35rem] font-medium tracking-tight text-[#1A1816] leading-[1.08] sm:leading-[1.04]">
              Built for builders. <br />
              <span className="italic font-normal text-[#FF2D2D]">Crafted for the ecosystem.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#5C564E] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              The official merchandise and goodies storefront for MST Blockchain. Heavyweight hoodies,
              developer-grade tees, laser-etched drinkware, and ecosystem essentials engineered for
              the global Web3 community.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 bg-[#1A1816] text-[#FAF7F2] text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition flex items-center justify-center gap-2.5 rounded-sm shadow-md"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=apparel"
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 border border-[#1A1816] text-[#1A1816] text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-white hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition flex items-center justify-center rounded-sm"
              >
                <span>Explore Apparel</span>
              </Link>
            </div>
          </div>

          {/* Right Asymmetrical Editorial Image Grid */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[370px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[480px]">
              {/* Main Editorial Hero Image */}
              <div className="relative aspect-[4/4.9] max-h-[490px] rounded-sm overflow-hidden border border-[#D5CCC0] shadow-xl bg-[#F8F5F0] flex items-center justify-center p-3.5 sm:p-4">
                <Image
                  src="/t-shirts/Tshirt 3.png"
                  alt="MST Blockchain Developer Heavyweight T-Shirt - Front Graphic"
                  fill
                  priority
                  className="object-contain object-center p-3.5 sm:p-5 drop-shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-white p-2.5 sm:p-3 bg-black/65 backdrop-blur-md rounded-xs border border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-semibold tracking-tight text-white">MST Developer Heavyweight Tee</span>
                    <span className="text-[#FF6B6B] font-semibold">₹1,499</span>
                  </div>
                  <p className="text-[10px] text-stone-300 mt-0.5">240 GSM Combed Compact Cotton • #BuildOnMST Edition</p>
                </div>
              </div>

              {/* Overlapping Floating Detail */}
              <div className="hidden sm:block absolute -bottom-5 -left-7 w-36 sm:w-40 aspect-square rounded-sm overflow-hidden border-4 border-white shadow-2xl bg-[#F8F5F0] rotate-[-3deg] flex items-center justify-center p-1.5">
                <Image
                  src="/t-shirts/Tshirt 4.png"
                  alt="MST Developer Heavyweight T-Shirt - Back Graphic Typography"
                  fill
                  className="object-contain object-center p-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
