'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { Order, OrderFulfillmentStatus, OrderPaymentStatus } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';

interface OrderDetailClientProps {
  order: Order;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [fulfillmentStatus, setFulfillmentStatus] = useState<OrderFulfillmentStatus>(order.fulfillmentStatus);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>(order.paymentStatus);
  const [carrier, setCarrier] = useState(order.tracking?.carrier || 'BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking?.trackingNumber || '');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        fulfillmentStatus,
        paymentStatus,
        tracking: trackingNumber ? { carrier, trackingNumber } : undefined,
        note: statusNote || undefined,
      };

      const res = await fetch(`/api/admin/orders/${order.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      success('Order status updated successfully');
      setStatusNote('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <Link
          href="/admin/orders"
          className="p-2 border border-white/10 bg-[#121212] rounded-xs text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
            Order Management
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Order #{order.orderNumber}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Items & Delivery Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Table */}
          <div className="bg-[#121212] p-6 rounded-sm border border-white/10 shadow-sm space-y-4">
            <h2 className="font-heading text-lg font-bold text-white pb-3 border-b border-white/10">
              Merchandise Item Snapshots
            </h2>

            <div className="divide-y divide-white/10">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-stone-900 rounded-sm overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain object-center p-1 bg-black/40"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Brand: {item.brand} {item.sizeLabel ? `• Size: ${item.sizeLabel}` : ''} {item.selectedColor || item.color ? `• Color: ${item.selectedColor || item.color}` : ''} {item.sku ? `• SKU: ${item.sku}` : ''}
                    </p>
                    <p className="text-xs text-white/80 font-medium mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="font-heading text-sm font-bold text-white">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-1.5 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#FF2D2D] font-medium">
                  <span>Discount ({order.discountCode})</span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-white font-medium">
                  {order.shippingFee === 0 ? 'Complimentary' : `₹${order.shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-base font-heading font-bold text-white">
                <span>Total Settled</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          <div className="bg-[#121212] p-6 rounded-sm border border-white/10 shadow-sm space-y-4">
            <h2 className="font-heading text-lg font-bold text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF2D2D]" />
              <span>Order Audit & Status Timeline</span>
            </h2>

            <div className="space-y-3">
              {order.timeline?.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#FF2D2D] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{ev.status}</p>
                    {ev.note && <p className="text-white/60 mt-0.5">{ev.note}</p>}
                    <p className="text-[10px] text-white/40 mt-0.5 font-mono">
                      {new Date(ev.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Update Status Form */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleUpdate} className="bg-[#121212] p-6 rounded-sm border border-white/10 shadow-sm space-y-4">
            <h3 className="font-heading text-lg font-bold text-white pb-3 border-b border-white/10">
              Update Status & Dispatch
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Fulfillment Status
              </label>
              <select
                value={fulfillmentStatus}
                onChange={e => setFulfillmentStatus(e.target.value as OrderFulfillmentStatus)}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm font-medium focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="unfulfilled">Unfulfilled</option>
                <option value="processing">Processing & Packing</option>
                <option value="packed">Packed (Ready for Courier)</option>
                <option value="shipped">Shipped (Dispatched)</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled (Auto-Restock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as OrderPaymentStatus)}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm font-medium focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="pending">Pending Payment</option>
                <option value="paid">Paid & Settled</option>
                <option value="refunded">Refunded (Restock)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                Courier Tracking Information
              </label>

              <div>
                <span className="block text-[11px] text-white/50 mb-1">Carrier Partner</span>
                <input
                  type="text"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  placeholder="e.g. BlueDart Express"
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-1.5 text-xs rounded-sm"
                />
              </div>

              <div>
                <span className="block text-[11px] text-white/50 mb-1">Tracking / AWB Number</span>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BD-8921049"
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-1.5 text-xs rounded-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">
                Timeline Audit Note (Optional)
              </label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Dispatched parcel with priority courier partner"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-1.5 text-xs rounded-sm"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 bg-[#FF2D2D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E02626] transition rounded-sm shadow-md disabled:opacity-50"
            >
              {updating ? 'Saving Status...' : 'Save Status Update'}
            </button>
          </form>

          {/* Customer & Address Details */}
          <div className="bg-[#121212] p-6 rounded-sm border border-white/10 shadow-sm space-y-3 text-xs">
            <h3 className="font-heading text-base font-bold text-white pb-2 border-b border-white/10">
              Customer Shipping Address
            </h3>
            <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
            <p className="text-white/70">{order.shippingAddress.street}</p>
            {order.shippingAddress.apartment && <p className="text-white/70">{order.shippingAddress.apartment}</p>}
            <p className="text-white/70">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
            <p className="text-white/50 pt-1">Phone: {order.customer.phone}</p>
            <p className="text-white/50">Email: {order.customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
