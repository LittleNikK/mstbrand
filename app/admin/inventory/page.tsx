import React from 'react';
import Link from 'next/link';
import { getInventoryMovements } from '@/lib/services/inventory.service';
import { getDb } from '@/lib/db/mongodb';
import { AlertTriangle, History } from 'lucide-react';

export default async function AdminInventoryPage() {
  const db = await getDb();

  const [movements, lowStockProducts] = await Promise.all([
    getInventoryMovements(undefined, 40),
    db.collection('products')
      .find({ status: 'published', stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(30)
      .toArray(),
  ]);

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
          Operations & Audits
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
          Inventory Movements & Stock Audit
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Every stock decrement, order reservation, and replenishment adjustment is tracked in an append-only audit log.
        </p>
      </div>

      {/* Low Stock Watchlist */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading text-xl font-bold text-white">
              Low Stock & Sold-Out Watchlist
            </h2>
          </div>
          <span className="text-xs text-white/50">
            {lowStockProducts.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Brand</th>
                <th className="py-3 px-6">SKU / Category</th>
                <th className="py-3 px-6">Stock Status</th>
                <th className="py-3 px-6 text-right">Price</th>
                <th className="py-3 px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {lowStockProducts.map(p => (
                <tr key={p._id.toString()} className="hover:bg-white/5 transition">
                  <td className="py-3 px-6 font-heading font-medium text-white">
                    {p.name}
                  </td>
                  <td className="py-3 px-6">{p.brand}</td>
                  <td className="py-3 px-6 font-mono text-[11px] text-white/60">
                    {p.sku || p.category}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                      p.stock === 0
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {p.stock === 0 ? 'SOLD OUT' : `${p.stock} Units Left`}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-heading font-bold text-white">
                    ₹{p.sellingPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="text-xs text-[#FF2D2D] hover:underline font-bold"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Inventory Movements Stream */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF2D2D]" />
            <h2 className="font-heading text-xl font-bold text-white">
              Stock Movement History
            </h2>
          </div>
          <span className="text-xs text-white/50">Recent 40 movements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Delta</th>
                <th className="py-3 px-6">Reference / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {movements.map(m => (
                <tr key={m._id.toString()} className="hover:bg-white/5 transition">
                  <td className="py-3 px-6 text-white/40 font-mono text-[11px]">
                    {new Date(m.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-6 font-medium text-white">
                    {m.productName || 'Product'}
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-[10px] py-0.5 px-2 bg-white/10 text-white rounded-xs border border-white/10 font-mono">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`font-mono font-bold ${m.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-white/60">
                    {m.reason} {m.referenceId && `(${m.referenceId})`}
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
