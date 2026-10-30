'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Store Announcement"
      className="bg-[#1A1816] text-[#FAF7F2] text-[11px] font-medium tracking-widest uppercase py-2 px-4 border-b border-stone-800"
    >
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between">
        <div className="flex-1 text-center flex items-center justify-center">
          <span>
            Genesis Drop Live: Official MST Blockchain Merchandise — Complimentary Shipping on orders over ₹2,999
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-400 hover:text-white p-1 -mr-1 transition"
          aria-label="Dismiss announcement"
          suppressHydrationWarning
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
