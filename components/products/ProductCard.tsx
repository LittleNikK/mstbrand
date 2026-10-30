'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { success } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isSoldOut = product.stock <= 0;
  const rawReference = (product.referencePrice && product.referencePrice > product.sellingPrice)
    ? product.referencePrice
    : (product.costPrice && product.costPrice > product.sellingPrice ? product.costPrice : null);
  const discountPercent =
    rawReference && rawReference > product.sellingPrice
      ? Math.round(((rawReference - product.sellingPrice) / rawReference) * 100)
      : 0;
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    setIsAdding(true);
    addItem(product);
    success(`Added "${product.name}" to your bag`);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    try {
      await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });
      success(isWishlisted ? 'Removed from wishlist' : 'Saved to your wishlist');
    } catch {
      setIsWishlisted(isWishlisted);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#E8E2D8] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D5CCC0]">
      {/* Image Container: Perfectly centered, never stretched */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-3/4 overflow-hidden bg-[#F8F5F0] flex items-center justify-center">
        <div className="absolute inset-0 p-3 sm:p-4 flex items-center justify-center">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`${product.imageFit === 'cover' ? 'object-cover' : 'object-contain object-center'} p-2 sm:p-3 transition-all duration-500 group-hover:scale-105 group-hover:opacity-0`}
          />
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`${product.imageFit === 'cover' ? 'object-cover' : 'object-contain object-center'} p-2 sm:p-3 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 absolute inset-0`}
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-10 sm:top-2.5 sm:left-2.5 sm:right-12 flex items-center gap-1.5 pointer-events-none z-10 flex-wrap">
          {discountPercent > 0 && !isSoldOut && (
            <span className="bg-[#FF2D2D] text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs shrink-0">
              {discountPercent}% OFF
            </span>
          )}

          {(product.isOneOfOne || product.isLimitedEdition) && !isSoldOut && (
            <span className="bg-white/95 text-[#FF2D2D] border border-[#E8E2D8] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs shrink-0">
              Limited
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 p-2 sm:p-2 rounded-full transition-all duration-200 shadow-sm ${isWishlisted
              ? 'bg-[#FF2D2D] text-white'
              : 'bg-white/90 text-stone-600 hover:text-[#FF2D2D] hover:bg-white'
            }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#1A1816]/65 backdrop-blur-[2px] flex items-center justify-center z-10 p-2">
            <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#FAF7F2] text-[#1A1816] text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-stone-300 shadow-lg text-center">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add Button Overlay (Desktop Hover) */}
        {!isSoldOut && (
          <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="w-full py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-[#FF2D2D] transition rounded-sm shadow-md"
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added to Bag
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Quick Add
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Card Info Section */}
      <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 space-y-1.5 sm:space-y-2">
        <div>
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#1A1816] group-hover:text-[#FF2D2D] transition-colors line-clamp-2 min-h-[2rem] sm:min-h-0 leading-snug tracking-tight">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-[#1A1816]">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {rawReference && rawReference > product.sellingPrice && (
              <span className="text-[10px] sm:text-[11px] text-[#8E877D] line-through">
                ₹{rawReference.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Quick Add touch button for mobile screens */}
          <div className="flex items-center">
            {!isSoldOut ? (
              <button
                onClick={handleQuickAdd}
                disabled={isAdding}
                aria-label={`Quick add ${product.name}`}
                className="sm:hidden p-2 min-w-[30px] min-h-[30px] rounded-sm bg-[#1A1816] text-white hover:bg-[#FF2D2D] active:scale-95 transition-all shadow-xs flex items-center justify-center"
              >
                {isAdding ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="sm:hidden text-[9px] uppercase font-mono tracking-wider text-[#7A7268]">
                Out
              </span>
            )}
            <span className="hidden sm:inline text-[10px] uppercase font-mono tracking-wider text-[#7A7268]">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
