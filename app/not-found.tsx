import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-10 rounded-sm border border-[#E8E2D8] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-[#FF2D2D]">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#FF2D2D]">
          404 Error
        </span>
        <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
          Merchandise Not Found
        </h1>
        <p className="text-xs text-[#5C564E] leading-relaxed">
          The merchandise release or drop page you are looking for has either concluded or been relocated.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-widest hover:bg-[#FF2D2D] transition rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return To Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
