import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/services/product.service';
import ProductCard from '@/components/products/ProductCard';
import ShopFiltersDropdown from '@/components/products/ShopFiltersDropdown';
import { RotateCcw, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    size?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
    q?: string;
    inStockOnly?: string;
    page?: string;
    collection?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = params.category || undefined;
  const condition = params.condition || undefined;
  const size = params.size || undefined;
  const sort = params.sort || 'newest';
  const q = params.q || undefined;
  const inStockOnly = params.inStockOnly === 'true';
  const page = Number(params.page) || 1;
  const collection = params.collection || undefined;

  const { products, pagination } = await getProducts({
    category,
    condition,
    size,
    sort,
    q,
    inStockOnly,
    page,
    collection,
    limit: 24,
  });

  const categories = [
    { label: 'All Official Merchandise', value: '' },
    { label: 'Hoodies, Shirts & Tees', value: 'apparel' },
    { label: 'Caps & Headwear', value: 'headwear' },
    { label: 'Tote Bags & Backpacks', value: 'bags' },
    { label: 'Bottles & Cups', value: 'drinkware' },
    { label: 'Diaries, Pens & Stands', value: 'stationery' },
    { label: 'Pins, Badges & Stickers', value: 'goodies' },
    { label: 'Gift Hampers & Mystery Boxes', value: 'bundles' },
  ];

  const officialItems = [
    { label: 'Hoodies', q: 'hoodie' },
    { label: 'T-Shirts', q: 't-shirt' },
    { label: 'Suitcase & Luggage', q: 'suitcase' },
    { label: 'Tote Bags', q: 'tote' },
    { label: 'Stickers Pack', q: 'stickers' },
    { label: 'MST Buddy', q: 'buddy' },
    { label: 'BuildOn MST', q: 'buildon' },
    { label: 'ChainPay', q: 'chainpay' },
    { label: 'BridgeKey Wallet', q: 'bridgekey' },
    { label: 'MST Academy', q: 'academy' },
    { label: 'Rapidex DEX', q: 'rapidex' },
    { label: 'Drinkware', q: 'test no 9' },
  ];

  const qualityGrades = ['Genesis Drop', 'Heavyweight Spec', 'Precision Hardware', 'Workspace Gear', 'Community Collectibles'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'];

  function buildQuery(updates: Record<string, string | undefined>) {
    const current = new URLSearchParams();
    if (category) current.set('category', category);
    if (condition) current.set('condition', condition);
    if (size) current.set('size', size);
    if (sort && sort !== 'newest') current.set('sort', sort);
    if (q) current.set('q', q);
    if (inStockOnly) current.set('inStockOnly', 'true');
    if (collection) current.set('collection', collection);

    Object.entries(updates).forEach(([key, val]) => {
      if (!val) {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });

    const queryStr = current.toString();
    return queryStr ? `/shop?${queryStr}` : '/shop';
  }

  const hasActiveFilters = Boolean(category || condition || size || q || inStockOnly || collection);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        {/* Header Title & Controls */}
        <div className="border-b border-[#E8E2D8] pb-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl text-[#1A1816]">
                The Ecosystem Vault
              </h1>
              <p className="text-xs sm:text-sm text-[#5C564E] mt-1 sm:mt-2 max-w-xl">
                Showing {pagination.totalCount} official MST Blockchain products and gear.
                Engineered with premium construction and verified specifications.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-[#7A7268] uppercase tracking-wider shrink-0">Sort:</span>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  href={buildQuery({ sort: 'newest' })}
                  className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border transition whitespace-nowrap ${sort === 'newest'
                      ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816]'
                      : 'bg-white text-[#5C564E] border-[#E8E2D8] hover:border-[#FF2D2D]'
                    }`}
                >
                  Newest Drop
                </Link>
                <Link
                  href={buildQuery({ sort: 'price-asc' })}
                  className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border transition whitespace-nowrap ${sort === 'price-asc'
                      ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816]'
                      : 'bg-white text-[#5C564E] border-[#E8E2D8] hover:border-[#FF2D2D]'
                    }`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={buildQuery({ sort: 'price-desc' })}
                  className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border transition whitespace-nowrap ${sort === 'price-desc'
                      ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816]'
                      : 'bg-white text-[#5C564E] border-[#E8E2D8] hover:border-[#FF2D2D]'
                    }`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>
          </div>

          {/* Unified Filters & Sort + Category Capsule Pills Bar (Matches Reference Image) */}
          <div className="mt-5 pt-4 sm:pt-5 border-t border-[#E8E2D8] relative z-30">
            <div className="flex items-center gap-2.5">
              {/* Leftmost Trigger: Filters & Sort Dropdown Button (Outside overflow container to prevent clipping) */}
              <div className="relative shrink-0 z-50">
                <ShopFiltersDropdown
                  categories={categories}
                  qualityGrades={qualityGrades}
                  sizes={sizes}
                />
              </div>

              {/* Capsule-Shaped Product Category & Item Pills (Horizontally scrollable) */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none min-w-0 flex-1">
                {officialItems.map(item => {
                  const isActive = q?.toLowerCase() === item.q.toLowerCase();
                  return (
                    <Link
                      key={item.label}
                      href={buildQuery({ q: isActive ? undefined : item.q, page: undefined })}
                      className={`text-xs sm:text-[13px] px-4 py-2 sm:py-2.5 rounded-full border transition whitespace-nowrap shrink-0 select-none ${isActive
                          ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-semibold shadow-xs'
                          : 'bg-white text-[#1A1816] border-[#E2E2E2] hover:border-[#1A1816] hover:bg-stone-50 font-normal sm:font-medium'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Main Layout: Full Width With Adjusted Cards */}
        <div className="space-y-6 sm:space-y-8">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-3 sm:p-3.5 rounded-sm border border-[#E8E2D8] shadow-xs">
              <span className="text-[#7A7268] font-semibold uppercase tracking-wider text-[11px]">Active Filters:</span>
              {category && (
                <Link
                  href={buildQuery({ category: undefined, page: undefined })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FF2D2D] hover:text-white border border-[#E8E2D8] rounded-xs text-[#1A1816] transition text-[11px] font-medium"
                >
                  Category: {category} ✕
                </Link>
              )}
              {condition && (
                <Link
                  href={buildQuery({ condition: undefined, page: undefined })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FF2D2D] hover:text-white border border-[#E8E2D8] rounded-xs text-[#1A1816] transition text-[11px] font-medium"
                >
                  Edition: {condition} ✕
                </Link>
              )}
              {size && (
                <Link
                  href={buildQuery({ size: undefined, page: undefined })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FF2D2D] hover:text-white border border-[#E8E2D8] rounded-xs text-[#1A1816] transition text-[11px] font-medium"
                >
                  Size: {size} ✕
                </Link>
              )}
              {inStockOnly && (
                <Link
                  href={buildQuery({ inStockOnly: undefined, page: undefined })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FF2D2D] hover:text-white border border-[#E8E2D8] rounded-xs text-[#1A1816] transition text-[11px] font-medium"
                >
                  In-Stock Only ✕
                </Link>
              )}
              {q && (
                <Link
                  href={buildQuery({ q: undefined, page: undefined })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FF2D2D] hover:text-white border border-[#E8E2D8] rounded-xs text-[#1A1816] transition text-[11px] font-medium"
                >
                  Item: &ldquo;{q}&rdquo; ✕
                </Link>
              )}
              <Link
                href="/shop"
                className="text-xs text-[#FF2D2D] hover:underline font-semibold ml-auto flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </Link>
            </div>
          )}

          {/* Adjusted Products Grid: Full Width 4 Columns on Desktop */}
          {products.length === 0 ? (
            <div className="bg-white border border-[#E8E2D8] p-12 text-center rounded-sm space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif-editorial text-2xl text-[#1A1816]">No matching merchandise found</h3>
              <p className="text-xs text-[#7A7268] max-w-md mx-auto leading-relaxed">
                We frequently release new genesis drops and ecosystem kits. Try clearing one or more filters or browse all official gear.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition"
                >
                  View All Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-[#E8E2D8] flex items-center justify-between">
              <span className="text-xs text-[#7A7268] font-mono">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex items-center gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={buildQuery({ page: String(pagination.page - 1) })}
                    className="px-4 py-2 border border-[#E8E2D8] bg-white text-xs text-[#1A1816] hover:bg-[#FAF7F2] rounded-sm transition font-medium"
                  >
                    Previous
                  </Link>
                )}
                {pagination.hasMore && (
                  <Link
                    href={buildQuery({ page: String(pagination.page + 1) })}
                    className="px-4 py-2 border border-[#1A1816] bg-[#1A1816] text-xs text-white hover:bg-[#FF2D2D] rounded-sm transition font-medium shadow-sm"
                  >
                    Next Page
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
