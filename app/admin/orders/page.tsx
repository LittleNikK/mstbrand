import React from 'react';
import Link from 'next/link';
import { getAllOrders } from '@/lib/services/order.service';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || undefined;
  const paymentStatus = params.paymentStatus || undefined;
  const search = params.search || undefined;

  const { orders, pagination } = await getAllOrders({
    page,
    limit: 25,
    status,
    paymentStatus,
    search,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
            Fulfillment & Shipping
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
            Customer Orders & Dispatches
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Total {pagination.totalCount} orders logged. Manage packing, assign tracking numbers, and fulfill orders.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Items</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Fulfillment</th>
                <th className="py-3 px-6 text-right">Total</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-6 font-mono font-semibold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-medium text-white">{order.customer.name}</div>
                    <div className="text-[11px] text-white/50">{order.customer.email}</div>
                  </td>
                  <td className="py-3.5 px-6 text-white/40">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-medium text-white">
                      {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 bg-white/10 text-white rounded-xs border border-white/10">
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-heading font-bold text-white">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="px-3 py-1 bg-[#FF2D2D] text-white hover:bg-[#E02626] transition text-xs font-bold uppercase tracking-wider rounded-xs shadow-md"
                    >
                      Manage
                    </Link>
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
