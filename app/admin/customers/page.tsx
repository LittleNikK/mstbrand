import React from 'react';
import { getDb } from '@/lib/db/mongodb';

export default async function AdminCustomersPage() {
  const db = await getDb();

  const users = await db.collection('users')
    .find({}, { projection: { passwordHash: 0, resetTokenHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  const orders = await db.collection('orders').find({}).toArray();

  const customerStats = new Map<string, { orderCount: number; totalSpent: number }>();
  for (const o of orders) {
    const email = o.customer?.email?.toLowerCase();
    if (!email) continue;
    const current = customerStats.get(email) || { orderCount: 0, totalSpent: 0 };
    customerStats.set(email, {
      orderCount: current.orderCount + 1,
      totalSpent: current.totalSpent + (o.paymentStatus === 'paid' ? o.total || 0 : 0),
    });
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
          Community Directory
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
          Customers & Builders
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Review customer profiles, account roles, order frequency, and lifetime merchandise spend.
        </p>
      </div>

      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Total Orders</th>
                <th className="py-3 px-6">Lifetime Spend</th>
                <th className="py-3 px-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(u => {
                const stats = customerStats.get(u.email?.toLowerCase()) || { orderCount: 0, totalSpent: 0 };
                return (
                  <tr key={u._id.toString()} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-6 font-medium text-white">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-6 text-white/90 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin'
                          ? 'bg-[#FF2D2D]/20 text-[#FF2D2D] border-[#FF2D2D]/40'
                          : u.role === 'staff'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-white/10 text-white/70 border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-white">
                      {stats.orderCount} {stats.orderCount === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="py-3.5 px-6 font-heading font-bold text-white">
                      ₹{stats.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6 text-right text-white/40">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
