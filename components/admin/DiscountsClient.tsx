'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { DiscountCode } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';

interface DiscountsClientProps {
  initialDiscounts: DiscountCode[];
}

export default function DiscountsClient({ initialDiscounts }: DiscountsClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxUses, setMaxUses] = useState('100');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: Number(value),
          minOrderAmount: Number(minOrderAmount) || 0,
          maxUses: Number(maxUses) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create discount');
      }

      success(`Promo code "${code.toUpperCase()}" created!`);
      setCode('');
      setValue('');
      router.refresh();
      // Add locally
      setDiscounts(prev => [data.discount, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating code';
      error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, discountCode: string) => {
    if (!confirm(`Delete coupon code "${discountCode}"?`)) return;

    try {
      const res = await fetch(`/api/admin/discounts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setDiscounts(prev => prev.filter(d => d._id !== id));
      success(`Promo code "${discountCode}" deleted`);
    } catch {
      error('Failed to delete coupon code');
    }
  };

  return (
    <div className="space-y-8">
      {/* Creation Card */}
      <div className="bg-[#121212] p-6 rounded-sm border border-white/10 shadow-sm space-y-4">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#FF2D2D]" />
          <span>Create New Promotion / Discount Code</span>
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Code Name *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MSTBUILDER10"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3 py-2 text-xs uppercase font-mono tracking-wider rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Discount Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
              className="w-full bg-[#181818] border border-white/10 text-white px-3 py-2 text-xs rounded-sm font-medium focus:outline-none focus:border-[#FF2D2D]"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed INR (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Value ({type === 'percentage' ? '%' : '₹'}) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={type === 'percentage' ? 90 : 100000}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={type === 'percentage' ? '15' : '500'}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Min. Order (₹)
            </label>
            <input
              type="number"
              min={0}
              value={minOrderAmount}
              onChange={e => setMinOrderAmount(e.target.value)}
              placeholder="2000"
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Max Redemptions
            </label>
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              placeholder="100"
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 bg-[#FF2D2D] text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#E02626] transition flex items-center justify-center gap-1 shadow-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Saving...' : 'Add Code'}</span>
          </button>
        </form>
      </div>

      {/* Codes Table */}
      <div className="bg-[#121212] rounded-sm border border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6">Promo Code</th>
                <th className="py-3 px-6">Discount</th>
                <th className="py-3 px-6">Min Order</th>
                <th className="py-3 px-6">Redemptions</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {discounts.map(d => (
                <tr key={d._id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-white">
                    {d.code}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[#FF2D2D]">
                    {d.type === 'percentage' ? `${d.value}% OFF` : `₹${d.value.toLocaleString('en-IN')} OFF`}
                  </td>
                  <td className="py-3.5 px-6 text-white/70">
                    {d.minOrderAmount ? `₹${d.minOrderAmount.toLocaleString('en-IN')}` : 'No minimum'}
                  </td>
                  <td className="py-3.5 px-6 text-white/70">
                    {d.usedCount} {d.maxUses ? `/ ${d.maxUses} uses` : 'uses'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase rounded-xs">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(d._id, d.code)}
                      className="p-1.5 text-white/40 hover:text-[#FF2D2D] transition"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
