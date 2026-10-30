'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, ExternalLink, Trash2, AlertTriangle, Loader2, Package, Search, X } from 'lucide-react';
import { Product } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';

interface AdminProductsClientTableProps {
  initialProducts: Product[];
  totalCount: number;
}

export default function AdminProductsClientTable({
  initialProducts,
  totalCount: initialTotalCount,
}: AdminProductsClientTableProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!productToDelete) return;

    const targetProduct = productToDelete;
    setDeletingId(targetProduct._id);

    try {
      const res = await fetch(`/api/admin/products/${targetProduct._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Optimistically remove from state
      setProducts(prev => prev.filter(p => p._id !== targetProduct._id));
      setTotalCount(prev => Math.max(0, prev - 1));
      setProductToDelete(null);

      success(`Product "${targetProduct.name}" has been permanently deleted.`);

      // Trigger Next.js router refresh so server-side data revalidates
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting product';
      error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121212] p-4 rounded-sm border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full pl-9 pr-9 py-2 bg-black/40 border border-white/10 rounded-xs text-xs text-white placeholder:text-white/30 focus:border-[#FF2D2D] focus:outline-none transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-white/50 flex items-center gap-2">
          <span>Showing</span>
          <span className="font-bold text-white">{filteredProducts.length}</span>
          <span>of</span>
          <span className="font-bold text-white">{totalCount}</span>
          <span>products</span>
        </div>
      </div>

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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">
                      {searchTerm ? 'No matching products found.' : 'No products found in this catalog.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p._id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-stone-900 rounded-xs overflow-hidden shrink-0 border border-white/10">
                          <Image
                            src={p.images?.[0]?.url || '/placeholder.png'}
                            alt={p.name}
                            fill
                            className="object-contain object-center p-1"
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
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                        <span className="font-medium text-white">{p.stock} in stock</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right font-heading font-bold text-white">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}`}
                          className="px-2 py-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xs transition flex items-center gap-1 text-xs"
                          title="Edit Product & Sizing"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>

                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xs transition"
                          title="View Live Storefront Product"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          disabled={deletingId === p._id}
                          className="px-2 py-1.5 text-rose-400/80 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xs transition flex items-center gap-1 text-xs cursor-pointer disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deletingId === p._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xs text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-white">Delete Product</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-white">&quot;{productToDelete.name}&quot;</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xs flex items-center gap-3">
              <div className="relative w-12 h-14 bg-stone-900 rounded-xs overflow-hidden shrink-0 border border-white/10">
                <Image
                  src={productToDelete.images?.[0]?.url || '/placeholder.png'}
                  alt={productToDelete.name}
                  fill
                  className="object-contain object-center p-1"
                />
              </div>
              <div className="min-w-0 text-xs">
                <div className="font-semibold text-white truncate">{productToDelete.name}</div>
                <div className="text-[11px] text-white/50">SKU: {productToDelete.sku || 'N/A'}</div>
                <div className="font-bold text-[#FF2D2D] mt-0.5">
                  ₹{productToDelete.sellingPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-rose-400/90 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xs leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently remove the product from the catalog, database, and storefront. Customers will no longer be able to view or purchase this item.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 bg-[#FF2D2D] hover:bg-[#E02626] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
