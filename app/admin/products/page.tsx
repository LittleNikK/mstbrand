import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/services/product.service';
import { Plus, ExternalLink } from 'lucide-react';

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
    limit: 20,
    q,
    category,
    status: undefined, // Include all statuses in admin
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

      {/* Products Table */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Brand & Category</th>
                <th className="py-3 px-6">SKU / Variants</th>
                <th className="py-3 px-6">Stock</th>
                <th className="py-3 px-6 text-right">Selling Price</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-stone-900 rounded-xs overflow-hidden shrink-0 border border-white/10">
                        <Image
                          src={p.images?.[0]?.url || '/placeholder.png'}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="font-heading text-sm font-semibold text-white hover:text-[#FF2D2D] flex items-center gap-1 truncate"
                        >
                          <span>{p.name}</span>
                          <ExternalLink className="w-3 h-3 text-white/40 shrink-0" />
                        </Link>
                        <span className="text-[10px] text-white/50 capitalize">
                          {p.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-white">{p.brand}</div>
                    <div className="text-[11px] text-white/50 capitalize">{p.category.replace('-', ' ')}</div>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-mono text-[11px] text-white/80">{p.sku || 'N/A'}</div>
                    {p.variants && p.variants.length > 0 ? (
                      <span className="text-[10px] text-[#FF2D2D] font-bold">
                        {p.variants.length} Variants
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/40">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-medium text-white">
                        {p.stock} in stock
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right font-heading font-bold text-white">
                    ₹{p.sellingPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-white/50 hover:text-white transition"
                        title="View Live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
