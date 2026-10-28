'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        setSubscribed(true);
        setNewsletterEmail('');
      }
    } catch {
      // Graceful error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#1A1816] text-[#FAF7F2] border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif-editorial text-2xl tracking-tight text-[#FAF7F2]">
              MST STORE
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              The official merchandise and goodies storefront for MST Blockchain.
              Engineered for builders, contributors, and the global Web3 ecosystem.
              Every piece is crafted from premium materials and shipped in plastic-free packaging.
            </p>
            <div className="pt-2 text-xs text-[#FF2D2D] font-medium tracking-wide">
              Official Merchandise Partner • <a href="https://www.mstblockchain.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">mstblockchain.com</a>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#FAF7F2]">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/shop?category=apparel" className="hover:text-[#FAF7F2] transition">Hoodies, Shirts & Tees</Link></li>
              <li><Link href="/shop?category=bags" className="hover:text-[#FAF7F2] transition">Tote Bags & Backpacks</Link></li>
              <li><Link href="/shop?category=drinkware" className="hover:text-[#FAF7F2] transition">Bottles & Ceramic Cups</Link></li>
              <li><Link href="/shop?category=stationery" className="hover:text-[#FAF7F2] transition">Diaries, Pens & Stands</Link></li>
              <li><Link href="/shop?category=goodies" className="hover:text-[#FAF7F2] transition">Pins, Badges & Stickers</Link></li>
              <li><Link href="/shop?category=bundles" className="hover:text-[#FAF7F2] transition">Gift Hampers & Mystery Boxes</Link></li>
              <li><Link href="/shop" className="hover:text-[#FAF7F2] transition">All 19 Official Products</Link></li>
            </ul>
          </div>

          {/* Ethics & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#FAF7F2]">
              Transparency
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/#standards" className="hover:text-[#FAF7F2] transition">Quality Standards Guide</Link></li>
              <li><Link href="/#standards" className="hover:text-[#FAF7F2] transition">Garment Sizing Specs</Link></li>
              <li><Link href="/#standards" className="hover:text-[#FAF7F2] transition">Authenticity Guarantee</Link></li>
              <li><Link href="/#standards" className="hover:text-[#FAF7F2] transition">Shipping & 7-Day Returns</Link></li>
              <li><Link href="/admin" className="hover:text-stone-300 text-stone-500 transition">Admin Operations Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Dispatch */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#FAF7F2]">
              Drop Dispatch
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribers receive 1-hour early access to limited genesis releases and hackathon kits.
            </p>
            {subscribed ? (
              <div className="p-3 bg-stone-900 border border-stone-700 text-xs text-[#FAF7F2] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FF2D2D]" />
                <span>You are on the MST drop list.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#FF2D2D] rounded-sm pr-10"
                    suppressHydrationWarning
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="absolute right-2 top-2 text-stone-400 hover:text-white transition"
                    aria-label="Subscribe to newsletter"
                    suppressHydrationWarning
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} MST STORE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prices in INR (₹)</span>
            <span>Razorpay Encrypted Checkout</span>
            <span>Plastic-Free Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
