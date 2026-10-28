import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db/mongodb';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const db = await getDb();

  const [orders, totalProducts, lowStockProducts] = await Promise.all([
    db.collection('orders').find({}).sort({ createdAt: -1 }).toArray(),
    db.collection('products').countDocuments({}),
    db.collection('products').countDocuments({ stock: { $lte: 1, $gt: 0 } }),
  ]);

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
            Live Store Analytics
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
            Operations & Financial Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#FF2D2D] text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#E02626] transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Merchandise Product</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-semibold">
            <span>Gross Sales (INR)</span>
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400">
              <span className="font-heading text-xs font-bold">₹</span>
            </div>
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-white/50">
            Across {paidOrders.length} verified settled orders
          </p>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-semibold">
            <span>Total Orders</span>
            <div className="p-2 bg-white/5 rounded-full text-[#FF2D2D] border border-white/10">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">
            {totalOrders}
          </p>
          <p className="text-[11px] text-white/50">
            Customer & guest checkout orders
          </p>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-semibold">
            <span>Average Order Value</span>
            <div className="p-2 bg-white/5 rounded-full text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">
            ₹{averageOrderValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-white/50">
            Merchandise ticket size
          </p>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-semibold">
            <span>Low Stock / Single Units</span>
            <div className="p-2 bg-rose-500/10 rounded-full text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">
            {lowStockProducts}
          </p>
          <p className="text-[11px] text-white/50">
            Of {totalProducts} total catalog products
          </p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-white">
            Recent Orders & Shipments
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-[#FF2D2D] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40">
            No orders logged in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-6">Order No.</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Fulfillment</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentOrders.map(o => (
                  <tr key={o._id.toString()} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-6 font-mono font-medium text-white">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-white">{o.customer?.name}</div>
                      <div className="text-[11px] text-white/50">{o.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 bg-white/10 text-white rounded-xs border border-white/10">
                        {o.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-heading font-bold text-white">
                      ₹{o.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/admin/orders/${o.orderNumber}`}
                        className="px-2.5 py-1 border border-white/10 bg-white/5 text-[11px] font-semibold text-white hover:bg-[#FF2D2D] hover:border-[#FF2D2D] transition rounded-xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
