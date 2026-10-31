import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/services/product.service';
import { Plus } from 'lucide-react';
import AdminProductsClientTable from '@/components/admin/AdminProductsClientTable';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const q = params.q || undefined;
  const category = params.category || undefined;

  const { products, pagination } = await getProducts({
    page,
    limit: 50,
    q,
    category,
    status: 'all', // Include all statuses (draft, published, archived) in admin
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
            Catalog Management
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
            Merchandise & Goodies Catalog
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Total {pagination.totalCount} merchandise items listed across official MST collections.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-[#FF2D2D] text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#E02626] transition flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Product Entry</span>
        </Link>
      </div>

      {/* Interactive Products Table with Direct Delete */}
      <AdminProductsClientTable
        initialProducts={products}
        totalCount={pagination.totalCount}
      />
    </div>
  );
}

