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

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'apparel':
        return 'vintage-pill-new';
      case 'headwear':
        return 'vintage-pill-excellent';
      case 'drinkware':
        return 'vintage-pill-verygood';
      case 'tech-accessories':
        return 'vintage-pill-good';
      default:
        return 'vintage-pill-fair';
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#E8E2D8] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D5CCC0]">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-3/4 overflow-hidden bg-[#F5F0E8]">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover img-zoom-hover transition-opacity duration-500 group-hover:opacity-0"
        />
        <Image
          src={secondaryImage}
          alt={`${product.name} alternate view`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover img-zoom-hover transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className={`editorial-badge ${getBadgeStyle(product.category)}`}>
            {product.category.replace('-', ' ')}
          </span>

          {(product.isOneOfOne || product.isLimitedEdition) && !isSoldOut && (
            <span className="editorial-badge bg-white/95 text-[#FF2D2D] border-[#E8E2D8] shadow-xs">
              Limited
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full transition-all duration-200 shadow-sm ${
            isWishlisted
              ? 'bg-[#FF2D2D] text-white'
              : 'bg-white/90 text-stone-600 hover:text-[#FF2D2D] hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#1A1816]/65 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-4 py-1.5 bg-[#FAF7F2] text-[#1A1816] text-xs font-semibold uppercase tracking-widest border border-stone-300 shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add Button Overlay */}
        {!isSoldOut && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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
      <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#7A7268] uppercase tracking-widest font-mono">
            <span>{product.brand || 'MST Ecosystem'}</span>
            {product.sku && <span>{product.sku}</span>}
          </div>
          <h3 className="font-serif-editorial text-sm font-medium text-[#1A1816] group-hover:text-[#FF2D2D] transition line-clamp-1 mt-1">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif-editorial text-sm font-semibold text-[#1A1816]">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.referencePrice && product.referencePrice > product.sellingPrice && (
              <span className="text-[11px] text-[#8E877D] line-through font-mono">
                ₹{product.referencePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7A7268]">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
