'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Truck,
  CreditCard,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'test_mode' | 'razorpay' | 'cod';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, discountAmount, discountCode, shippingFee, total, clearCart } = useCart();
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1); // 1: Shipping & Details, 2: Payment & Review
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
    shippingMethod: 'standard',
    paymentMethod: 'test_mode',
  });

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        ...(user.addresses?.[0] ? {
          street: user.addresses[0].street,
          apartment: user.addresses[0].apartment || '',
          city: user.addresses[0].city,
          state: user.addresses[0].state,
          postalCode: user.addresses[0].postalCode,
        } : {}),
      }));
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 border border-[#E8E2D8] rounded-sm shadow-sm">
          <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto" />
          <h2 className="font-serif-editorial text-2xl text-[#1A1816]">Your bag is currently empty</h2>
          <p className="text-xs text-[#5C564E]">Please add merchandise items to your bag before checking out.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D]"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      error('Please fill in all mandatory delivery address fields.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutData: {
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            },
            shippingAddress: {
              fullName: formData.name,
              phone: formData.phone,
              street: formData.street,
              apartment: formData.apartment || undefined,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
              isDefault: true,
            },
            shippingMethod: formData.shippingMethod,
            paymentMethod: formData.paymentMethod,
            discountCode: discountCode || undefined,
          },
          cartItems: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            variantId: i.variantId,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout initiation failed');
      }

      const createdOrder = data.order;

      if (formData.paymentMethod === 'test_mode') {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: createdOrder.orderNumber,
            isTestMode: true,
            razorpayOrderId: data.paymentInfo?.orderId || `test_order_${Date.now()}`,
            razorpayPaymentId: `test_pay_${Date.now()}`,
            razorpaySignature: 'test_verified',
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || 'Payment verification failed');
        }

        clearCart();
        success(`Order #${createdOrder.orderNumber} confirmed!`);
        router.push(`/order/${createdOrder.orderNumber}`);
      } else if (formData.paymentMethod === 'cod') {
        clearCart();
        success(`Order #${createdOrder.orderNumber} confirmed via Cash on Delivery!`);
        router.push(`/order/${createdOrder.orderNumber}`);
      } else {
        clearCart();
        router.push(`/order/${createdOrder.orderNumber}`);
      }
    } catch (err: unknown) {
      console.error('Order completion error:', err);
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        {/* Step Indicator */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#7A7268]">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1A1816]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step > 1 ? 'bg-[#FF2D2D] text-white' : 'border border-[#1A1816] text-[#1A1816]'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span>Delivery Address</span>
            </div>
            <div className="w-12 h-px bg-[#E8E2D8]" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1A1816]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step > 2 ? 'bg-[#FF2D2D] text-white' : step === 2 ? 'border border-[#1A1816] text-[#1A1816]' : 'border border-stone-300'
              }`}>
                2
              </span>
              <span>Payment & Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            {step === 1 ? (
              <form onSubmit={handleProceedToPayment} className="bg-white p-8 rounded-sm border border-[#E8E2D8] space-y-6 shadow-sm">
                <div className="border-b border-[#E8E2D8] pb-4">
                  <h2 className="font-serif-editorial text-2xl text-[#1A1816]">
                    Contact Information
                  </h2>
                  <p className="text-xs text-[#7A7268] mt-1">
                    We will send order tracking updates and shipment notifications here.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rohan Mehta"
                      className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="rohan@example.com"
                      className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                      Mobile Number (For Courier OTP) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98200 12345"
                      className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                    />
                  </div>
                </div>

                <div className="border-b border-[#E8E2D8] pb-4 pt-4">
                  <h2 className="font-serif-editorial text-2xl text-[#1A1816]">
                    Shipping Destination
                  </h2>
                  <p className="text-xs text-[#7A7268] mt-1">
                    Delivered safely via BlueDart or Delhivery Express in sealed plastic-free packaging.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Flat / House No., Building Name, Street"
                      className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                      Apartment / Suite / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Near Tech Park, Floor 3"
                      className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="400050"
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                  <Link
                    href="/cart"
                    className="text-xs text-[#7A7268] hover:text-[#1A1816] flex items-center gap-1 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return To Bag
                  </Link>

                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center gap-2 shadow-md"
                  >
                    <span>Continue To Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Payment & Review */
              <div className="bg-white p-8 rounded-sm border border-[#E8E2D8] space-y-6 shadow-sm">
                <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif-editorial text-2xl text-[#1A1816]">
                      Review & Payment Method
                    </h2>
                    <p className="text-xs text-[#7A7268] mt-1">
                      Choose your preferred payment method to complete the order.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#FF2D2D] hover:underline font-medium"
                  >
                    Edit Shipping Details
                  </button>
                </div>

                {/* Delivery Snapshot */}
                <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D8] rounded-sm text-xs space-y-1">
                  <p className="text-[#7A7268] font-semibold uppercase tracking-wider text-[10px]">
                    Shipping To:
                  </p>
                  <p className="font-medium text-[#1A1816]">{formData.name} • {formData.phone}</p>
                  <p className="text-[#5C564E]">
                    {formData.street}{formData.apartment ? `, ${formData.apartment}` : ''}, {formData.city}, {formData.state} — {formData.postalCode}
                  </p>
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                    Select Payment Option
                  </label>

                  {/* Test Mode */}
                  <label className={`block p-4 border rounded-sm cursor-pointer transition ${
                    formData.paymentMethod === 'test_mode'
                      ? 'border-[#FF2D2D] bg-[#FFF0F0] ring-1 ring-[#FF2D2D]'
                      : 'border-[#E8E2D8] hover:border-stone-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="test_mode"
                        checked={formData.paymentMethod === 'test_mode'}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#FF2D2D]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#1A1816]">
                            Verified Test Payment (Development Simulation)
                          </span>
                          <span className="text-[10px] bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2] px-2 py-0.5 rounded-xs font-medium">
                            Instant Local Simulation
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5C564E]">
                          Executes server signature verification, atomic inventory decrements, and creates an authentic order in MongoDB without charging a real card.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Razorpay Gateway */}
                  <label className={`block p-4 border rounded-sm cursor-pointer transition ${
                    formData.paymentMethod === 'razorpay'
                      ? 'border-[#FF2D2D] bg-[#FFF0F0] ring-1 ring-[#FF2D2D]'
                      : 'border-[#E8E2D8] hover:border-stone-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#FF2D2D]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#FF2D2D]" />
                          <span className="font-semibold text-xs text-[#1A1816]">
                            Razorpay (UPI, Credit/Debit Cards, NetBanking)
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5C564E]">
                          Supports PhonePe, Google Pay, Paytm, all Indian cards, and NetBanking.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`block p-4 border rounded-sm cursor-pointer transition ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#FF2D2D] bg-[#FFF0F0] ring-1 ring-[#FF2D2D]'
                      : 'border-[#E8E2D8] hover:border-stone-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#FF2D2D]"
                      />
                      <div className="space-y-1">
                        <span className="font-semibold text-xs text-[#1A1816]">
                          Cash on Delivery (Pay upon arrival)
                        </span>
                        <p className="text-[11px] text-[#5C564E]">
                          Pay in cash or UPI directly to the courier agent upon parcel delivery.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#7A7268] hover:text-[#1A1816] flex items-center gap-1 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back To Address
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reserving Stock & Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Authorize Payment • ₹{total.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Snapshot */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-[#E8E2D8] space-y-4 shadow-sm">
              <h3 className="font-serif-editorial text-xl font-medium text-[#1A1816] pb-3 border-b border-[#E8E2D8]">
                Items In Order ({items.length})
              </h3>

              <div className="divide-y divide-[#F4EFEA] max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-16 bg-stone-100 rounded-sm overflow-hidden shrink-0 border border-[#E8E2D8]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain object-center p-1 bg-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1816] truncate font-sans tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#7A7268] font-mono">
                        {item.selectedSize ? `Size: ${item.selectedSize}` : ''} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#1A1816]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs text-[#5C564E] pt-3 border-t border-[#E8E2D8]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#1A1816] font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF2D2D] font-medium">
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
                <div className="flex justify-between">
                  <span>Taxes (GST)</span>
                  <span className="text-[#1A1816] font-medium">Included</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E8E2D8] text-base font-semibold text-[#1A1816]">
                  <span>Total Amount</span>
                  <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="pt-3 border-t border-[#E8E2D8] text-[11px] text-[#7A7268] space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF2D2D]" />
                  <span>Atomic stock check prevents duplicate orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#FF2D2D]" />
                  <span>Express tracked courier dispatch within 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
