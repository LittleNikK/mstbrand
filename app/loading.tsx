import React from 'react';

export default function Loading() {
  return (
    <div className="bg-[#0A0A0A] min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#FF2D2D] border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="font-heading text-xs tracking-widest uppercase text-white/50 block font-semibold">
          Loading MST Store...
        </span>
      </div>
    </div>
  );
}
