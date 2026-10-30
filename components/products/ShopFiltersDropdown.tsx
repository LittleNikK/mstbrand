'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, X, Check, ArrowDownUp } from 'lucide-react';

interface CategoryOption {
  label: string;
  value: string;
}

interface ShopFiltersDropdownProps {
  categories: CategoryOption[];
  qualityGrades: string[];
  sizes: string[];
}

export default function ShopFiltersDropdown({
  categories,
  qualityGrades,
  sizes,
}: ShopFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || undefined;
  const currentCondition = searchParams.get('condition') || undefined;
  const currentSize = searchParams.get('size') || undefined;
  const currentSort = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';

  // Count active filters (excluding sort and page)
  let activeCount = 0;
  if (currentCategory) activeCount++;
  if (currentCondition) activeCount++;
  if (currentSize) activeCount++;
  if (inStockOnly) activeCount++;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Helper to build URL with updated search params
  const createQueryUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // reset to page 1 on filter change

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  const resetAllUrl = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  const sortOptions = [
    { label: 'Newest Drop', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  return (
    <div className="relative inline-block text-left shrink-0 z-40" ref={dropdownRef}>
      {/* Trigger Button - Exactly Styled Like Reference Image */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold text-[#1A1816] bg-[#ECECEC] hover:bg-[#E0E0E0] active:bg-[#D8D8D8] transition-colors whitespace-nowrap cursor-pointer select-none shrink-0 ${
          activeCount > 0 || isOpen ? 'ring-1 ring-[#1A1816]' : ''
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#1A1816]" />
        <span>Filters &amp; Sort</span>
        {activeCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-[#FF2D2D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Overlay Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[calc(100vw-32px)] sm:w-96 md:w-[460px] bg-white rounded-xl border border-[#E8E2D8] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#E8E2D8] bg-[#FAF7F2]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF2D2D]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1816]">
                Filters &amp; Sort
              </h3>
              {activeCount > 0 && (
                <span className="text-[10px] bg-[#FF2D2D] text-white px-2 py-0.5 rounded-full font-bold">
                  {activeCount} Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <Link
                  href={resetAllUrl()}
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] text-[#FF2D2D] hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-[#1A1816] rounded-xs transition cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Body with Scroll */}
          <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-5 text-xs">
            {/* Sort Options */}
            <div className="space-y-2.5">
              <span className="font-semibold uppercase tracking-wider text-[#1A1816] flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-[#FF2D2D]" />
                Sort Products
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map(opt => {
                  const isSelected = currentSort === opt.value;
                  return (
                    <Link
                      key={opt.value}
                      href={createQueryUrl({ sort: opt.value })}
                      onClick={() => setIsOpen(false)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-semibold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#5C564E] border-[#E8E2D8] hover:border-[#1A1816] hover:text-[#1A1816]'
                      }`}
                    >
                      {opt.label}
                      {isSelected && <Check className="w-3 h-3 text-[#FF2D2D]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8E2D8]">
              <span className="font-semibold uppercase tracking-wider text-[#1A1816] block">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => {
                  const isSelected = (!currentCategory && !cat.value) || currentCategory === cat.value;
                  return (
                    <Link
                      key={cat.label}
                      href={createQueryUrl({ category: cat.value || undefined })}
                      onClick={() => setIsOpen(false)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-semibold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#5C564E] border-[#E8E2D8] hover:border-[#1A1816] hover:text-[#1A1816]'
                      }`}
                    >
                      {cat.label}
                      {isSelected && <Check className="w-3 h-3 text-[#FF2D2D]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Gear Edition / Condition */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8E2D8]">
              <span className="font-semibold uppercase tracking-wider text-[#1A1816] block">
                Gear Edition
              </span>
              <div className="flex flex-wrap gap-1.5">
                {qualityGrades.map(grade => {
                  const isSelected = currentCondition === grade;
                  return (
                    <Link
                      key={grade}
                      href={createQueryUrl({ condition: isSelected ? undefined : grade })}
                      onClick={() => setIsOpen(false)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-semibold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#5C564E] border-[#E8E2D8] hover:border-[#1A1816] hover:text-[#1A1816]'
                      }`}
                    >
                      {grade}
                      {isSelected && <Check className="w-3 h-3 text-[#FF2D2D]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Standard Sizes */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8E2D8]">
              <span className="font-semibold uppercase tracking-wider text-[#1A1816] block">
                Standard Size
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {sizes.map(s => {
                  const isSelected = currentSize === s;
                  return (
                    <Link
                      key={s}
                      href={createQueryUrl({ size: isSelected ? undefined : s })}
                      onClick={() => setIsOpen(false)}
                      className={`text-center text-xs py-1.5 rounded-full border font-medium transition ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-bold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#5C564E] border-[#E8E2D8] hover:border-[#1A1816] hover:text-[#1A1816]'
                      }`}
                    >
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Available Gear Only (In-Stock) */}
            <div className="pt-4 border-t border-[#E8E2D8]">
              <Link
                href={createQueryUrl({ inStockOnly: inStockOnly ? undefined : 'true' })}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-1 text-xs text-[#1A1816] font-medium group"
              >
                <span className="group-hover:text-[#FF2D2D] transition-colors">
                  In-Stock Gear Only
                </span>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    inStockOnly ? 'bg-[#FF2D2D]' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      inStockOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-[#FAF7F2] border-t border-[#E8E2D8] flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              {activeCount > 0 ? `${activeCount} filter(s) applied` : 'Showing all products'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-[#1A1816] hover:bg-[#FF2D2D] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition cursor-pointer"
            >
              Apply / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
