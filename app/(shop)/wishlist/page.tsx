'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  sellingPrice: number;
  image: string;
  stock: number;
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const { success, error } = useToast();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    async function fetchWishlist() {
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        if (data.wishlist) {
          setItems(data.wishlist);
        }
      } catch {
        error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [user, error]);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i._id !== productId));
      success('Removed from wishlist');
    } catch {
      error('Failed to remove item');
    }
  };

  const handleMoveToBag = (item: WishlistItem) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addItem(item as any);
    success(`"${item.name}" added to bag`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1A1816] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#7A7268]">Loading your saved gear...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2] px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 rounded-sm border border-[#E8E2D8] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EFEA] border border-[#E8E2D8] flex items-center justify-center text-[#FF2D2D]">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="font-serif-editorial text-2xl text-[#1A1816]">Save Your Favorite Gear</h2>
          <p className="text-xs text-[#5C564E] leading-relaxed">
            Please log in or create an account to save official MST merchandise and track drop releases.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-widest hover:bg-[#FF2D2D] transition rounded-sm shadow-sm"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#E8E2D8] pb-6 mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1816]">
              Your Saved Gear
            </h1>
            <p className="text-xs text-[#7A7268] mt-1 font-sans">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved in your wishlist
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[#FF2D2D] hover:underline flex items-center gap-1"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#E8E2D8] p-12 text-center rounded-sm space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F4EFEA] border border-[#E8E2D8] flex items-center justify-center text-[#7A7268]">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#1A1816]">No saved gear yet</h3>
            <p className="text-xs text-[#5C564E] max-w-sm mx-auto leading-relaxed">
              Click the heart icon on any merchandise card or detail page to save it for later.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition"
              >
                Explore The Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <div
                key={item._id}
                className="group relative flex flex-col bg-white border border-[#E8E2D8] rounded-sm overflow-hidden hover:border-[#D5CCC0] transition shadow-xs"
              >
                <Link href={`/product/${item.slug}`} className="block relative aspect-3/4 bg-[#F5F0E8] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover img-zoom-hover"
                  />
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-[#7A7268] uppercase tracking-widest font-sans">
                      {item.brand || 'MST Ecosystem'}
                    </span>
                    <h3 className="font-serif-editorial text-sm font-medium text-[#1A1816] line-clamp-1 mt-0.5">
                      <Link href={`/product/${item.slug}`} className="hover:text-[#FF2D2D] transition">{item.name}</Link>
                    </h3>
                    <p className="font-serif-editorial text-sm font-semibold text-[#1A1816] mt-1">
                      ₹{item.sellingPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleMoveToBag(item)}
                      className="flex-1 py-2 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                    </button>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="p-2 text-[#7A7268] hover:text-[#FF2D2D] transition rounded-sm border border-[#E8E2D8] hover:border-[#D5CCC0]"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
