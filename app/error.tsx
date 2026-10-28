'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-10 rounded-sm border border-[#E8E2D8] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF5F2] border border-[#FF2D2D] flex items-center justify-center text-[#FF2D2D]">
          <AlertCircle className="w-8 h-8 stroke-[1.5]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#FF2D2D]">
          System Notice
        </span>
        <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
          Something Went Wrong
        </h1>
        <p className="text-xs text-[#5C564E] leading-relaxed">
          We encountered an issue loading this store view. Your shopping bag and account state remain secure.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-[#E8E2D8] bg-white text-xs font-semibold uppercase tracking-wider text-[#1A1816] rounded-sm hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
