'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, Tag, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function CartPage() {
  const {
    items,
    subtotal,
    discountAmount,
    discountCode,
    shippingFee,
    total,
    removeItem,
    updateQuantity,
    applyDiscount,
    removeDiscount,
    freeShippingProgress,
  } = useCart();

  const { success, error } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const amountToFreeShipping = Math.max(0, 2999 - (subtotal - discountAmount));

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

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white p-10 rounded-sm border border-[#E8E2D8] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-stone-400">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="font-serif-editorial text-2xl text-[#1A1816]">Your Bag Is Empty</h1>
          <p className="text-xs text-[#5C564E] leading-relaxed">
            You haven’t added any official merchandise to your shopping bag yet. Explore our curated drops before limited gear is claimed.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-widest hover:bg-[#FF2D2D] transition rounded-sm shadow-md"
            >
              Explore The Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#E8E2D8] pb-6 mb-8">
          <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1816]">
            Shopping Bag
          </h1>
          <p className="text-xs text-[#5C564E] mt-1">
            Review your MST merchandise selections before proceeding to checkout.
          </p>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="bg-white p-4 rounded-sm border border-[#E8E2D8] mb-8">
          <div className="flex items-center justify-between text-xs text-[#5C564E] mb-2 font-medium">
            <span>
              {amountToFreeShipping === 0
                ? '🎉 Congratulations! You have unlocked complimentary express shipping.'
                : `Add ₹${amountToFreeShipping.toLocaleString('en-IN')} more to qualify for complimentary express shipping.`}
            </span>
            <span className="font-mono">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-[#F4EFEA] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FF2D2D] h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-sm border border-[#E8E2D8] divide-y divide-[#E8E2D8]">
              {items.map(item => (
                <div key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId} className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative w-24 h-32 bg-stone-100 rounded-sm overflow-hidden shrink-0 border border-[#E8E2D8]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#7A7268] font-semibold font-mono">
                            {item.brand || 'MST Ecosystem'}
                          </span>
                          <h3 className="font-serif-editorial text-base font-medium text-[#1A1816] hover:text-[#FF2D2D] mt-0.5">
                            <Link href={`/product/${item.slug}`}>{item.name}</Link>
                          </h3>
                        </div>
                        <span className="font-serif-editorial text-lg font-semibold text-[#1A1816]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-[#5C564E]">
                        {item.selectedSize && <span>Size: <strong className="text-[#1A1816]">{item.selectedSize}</strong></span>}
                        {item.selectedColor && (
                          <>
                            <span>•</span>
                            <span>Color: <strong className="text-[#1A1816]">{item.selectedColor}</strong></span>
                          </>
                        )}
                        {item.isOneOfOne && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center text-[#FF2D2D] font-semibold text-[11px] uppercase tracking-wider">
                              Limited
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F4EFEA]">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#E8E2D8] rounded-sm bg-[#FAF7F2]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="px-2.5 py-1 text-xs text-[#5C564E] hover:text-[#1A1816] hover:bg-stone-200"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-medium text-[#1A1816] font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="px-2.5 py-1 text-xs text-[#5C564E] hover:text-[#1A1816] hover:bg-stone-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-stone-400 hover:text-red-600 transition text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] hover:text-[#FF2D2D] hover:underline"
              >
                ← Continue Browsing Catalog
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-[#E8E2D8] space-y-4 shadow-sm">
              <h2 className="font-serif-editorial text-xl font-medium text-[#1A1816] pb-3 border-b border-[#E8E2D8]">
                Order Summary
              </h2>

              {/* Coupon Form */}
              {discountCode ? (
                <div className="flex items-center justify-between p-3 bg-[#F4EFEB] border border-[#DFD5C9] rounded-sm text-xs">
                  <div className="flex items-center gap-2 text-[#FF2D2D] font-medium">
                    <Tag className="w-4 h-4" />
                    <span>Coupon <strong>{discountCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-stone-400 hover:text-stone-700 text-xs font-medium"
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
                    className="flex-1 bg-[#FAF7F2] border border-[#E8E2D8] px-3 py-2 text-xs uppercase tracking-wider rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#FF2D2D] transition disabled:opacity-50"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-[#5C564E] pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#1A1816] font-medium font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF2D2D] font-medium">
                    <span>Discount ({discountCode})</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[#1A1816] font-medium">
                    {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (GST)</span>
                  <span className="text-[#1A1816] font-medium">Inclusive</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#E8E2D8] text-base font-serif-editorial font-semibold text-[#1A1816]">
                  <span>Total</span>
                  <span className="font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm shadow-md"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Security badges */}
              <div className="pt-4 border-t border-[#E8E2D8] space-y-2 text-[11px] text-[#7A7268]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF2D2D]" />
                  <span>256-bit encrypted secure payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FF2D2D]" />
                  <span>Plastic-free recyclable kraft packaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
