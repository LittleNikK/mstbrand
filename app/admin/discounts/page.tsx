import React from 'react';
import { getDb } from '@/lib/db/mongodb';
import DiscountsClient from '@/components/admin/DiscountsClient';
import { DiscountCode } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  const db = await getDb();
  const docs = await db.collection('discount_codes').find({}).sort({ createdAt: -1 }).toArray();

  const formatted: DiscountCode[] = docs.map(d => ({
    _id: d._id.toString(),
    code: d.code,
    type: d.type,
    value: d.value,
    minOrderAmount: d.minOrderAmount || 0,
    maxUses: d.maxUses || 0,
    usedCount: d.usedCount || 0,
    expiresAt: d.expiresAt,
    isActive: Boolean(d.isActive),
    createdAt: d.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
          Promotions & Drops
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
          Vouchers & Discount Codes
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Manage promotional vouchers with minimum order limits, usage quotas, and expiration dates for MST community drops.
        </p>
      </div>

      <DiscountsClient initialDiscounts={formatted} />
    </div>
  );
}
