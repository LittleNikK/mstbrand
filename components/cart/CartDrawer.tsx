'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function CartDrawer() {
  const {
    items,
    subtotal,
    shippingFee,
    discountAmount,
    discountCode,
    total,
    isCartOpen,
    closeCart,
    removeItem,
    applyDiscount,
    removeDiscount,
    freeShippingProgress,
  } = useCart();

  const { success, error } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    const res = await applyDiscount(couponInput);
    setApplyingCoupon(false);
    if (res.success) {
      success(res.message);
      setCouponInput('');
    } else {
      error(res.message);
    }
  };

  const amountToFreeShipping = Math.max(0, 2999 - (subtotal - discountAmount));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E8E2D8] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#E8E2D8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF2D2D]" />
              <h2 className="font-serif-editorial text-lg sm:text-xl font-medium tracking-tight text-[#1A1816]">
                Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 -mr-1.5 text-stone-500 hover:text-stone-900 transition"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Bar */}
          <div className="bg-[#F4EFEA] px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#E8E2D8]">
            <div className="flex items-center justify-between text-xs text-[#5C564E] mb-1.5 font-medium">
              <span className="truncate pr-2">
                {amountToFreeShipping === 0
                  ? '🎉 Complimentary Shipping Unlocked'
                  : `Add ₹${amountToFreeShipping.toLocaleString('en-IN')} for Free Shipping`}
              </span>
              <span className="font-mono shrink-0">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#E8E2D8] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FF2D2D] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#EDE7DD] flex items-center justify-center text-stone-500">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif-editorial text-lg text-[#1A1816]">Your bag is currently empty</h3>
                <p className="text-xs text-[#7A7268] max-w-xs mx-auto leading-relaxed">
                  Discover official MST Blockchain hoodies, graphic tees, caps, tumblers, and desk accessories.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 inline-flex items-center justify-center px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase hover:bg-[#FF2D2D] transition rounded-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId}
                  className="flex gap-4 pb-6 border-b border-[#E8E2D8] last:border-b-0"
                >
                  <div className="w-20 h-24 bg-stone-200 relative shrink-0 overflow-hidden rounded-sm border border-[#E8E2D8]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain object-center p-1 bg-white"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-sans text-xs sm:text-sm font-semibold text-[#1A1816] line-clamp-1 tracking-tight">
                          <Link href={`/product/${item.slug}`} onClick={closeCart} className="hover:text-[#FF2D2D] transition-colors">
                            {item.name}
                          </Link>
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-stone-400 hover:text-red-600 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(item.selectedSize || item.selectedColor) && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#7A7268] font-medium tracking-wide">
                            {item.selectedSize && `Size ${item.selectedSize}`} {item.selectedColor && `• ${item.selectedColor}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="editorial-badge text-[10px] py-0.5 px-2 bg-stone-100 text-stone-700">
                          Official Gear
                        </span>
                        {item.isOneOfOne && (
                          <span className="inline-flex items-center text-[10px] text-[#FF2D2D] font-semibold tracking-wider uppercase">
                            Limited
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-[#7A7268]">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-[#1A1816]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#E8E2D8] space-y-3.5 sm:space-y-4">
              {/* Promo code input */}
              {discountCode ? (
                <div className="flex items-center justify-between p-2.5 bg-[#F4EFEB] border border-[#DFD5C9] rounded-sm text-xs">
                  <div className="flex items-center gap-2 text-[#FF2D2D] font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{discountCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-stone-400 hover:text-stone-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. MSTBUILDER10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#FAF7F2] border border-[#E8E2D8] px-3 py-2 text-xs text-[#1A1816] uppercase tracking-wider rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-medium rounded-sm hover:bg-[#FF2D2D] transition disabled:opacity-50"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {/* Summary details */}
              <div className="space-y-1.5 text-xs text-[#5C564E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#1A1816] font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF2D2D]">
                    <span>Discount ({discountCode})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#1A1816] font-medium">
                    {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8E2D8] text-sm font-semibold text-[#1A1816]">
                  <span>Total</span>
                  <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-medium tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
