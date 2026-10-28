'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Share2,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Check,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { success } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Variant selection support
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const effectivePrice = selectedVariant?.price || product.sellingPrice;
  const effectiveStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
  const isSoldOut = effectiveStock <= 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', alt: product.name, isPrimary: true }];

  const currentImage = images[activeImageIndex] || images[0];

  const handleAddToCart = () => {
    if (isSoldOut) return;
    setIsAdding(true);
    addItem(product, 1, selectedVariant?.id);
    success(`"${product.name}" added to your bag.`);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      success('Link copied to clipboard');
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleWishlist = async () => {
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
    <div className="bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A7268] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#1A1816]">Home</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#1A1816] capitalize">
            {product.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-[#1A1816] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-4/5 rounded-sm overflow-hidden border border-[#E8E2D8] bg-stone-100 shadow-sm">
              <Image
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />

              {/* Condition Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className={`editorial-badge ${getBadgeStyle(product.category)} shadow-sm`}>
                  {product.category.replace('-', ' ')}
                </span>
                {(product.isOneOfOne || product.isLimitedEdition) && (
                  <span className="editorial-badge bg-white/95 text-[#FF2D2D] border-[#E8E2D8] shadow-sm">
                    Limited Edition
                  </span>
                )}
              </div>

              {/* Sold out overlay */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-[#1A1816]/70 backdrop-blur-xs flex items-center justify-center z-20">
                  <span className="px-6 py-2 bg-[#FAF7F2] text-[#1A1816] text-xs font-semibold uppercase tracking-widest border border-stone-300 shadow-xl">
                    Merchandise Piece Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 aspect-square rounded-sm overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#FF2D2D] ring-2 ring-[#FF2D2D]/20 shadow-xs'
                        : 'border-[#E8E2D8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Purchase */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#7A7268] tracking-widest uppercase font-medium mb-1.5 font-mono">
                <span>{product.brand || 'MST Ecosystem'}</span>
                <span>{selectedVariant?.sku || product.sku || 'MST-ORIGINAL'}</span>
              </div>

              <h1 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1A1816] leading-tight">
                {product.name}
              </h1>

              {/* Price & Reference */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#1A1816]">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.referencePrice && product.referencePrice > effectivePrice && (
                  <span className="text-sm text-[#8E877D] line-through font-mono">
                    Est. Market Value: ₹{product.referencePrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] text-[#2F4A2C] font-medium bg-[#EBF3EA] px-2 py-0.5 rounded-xs">
                  Taxes Included
                </span>
              </div>
            </div>

            {/* One-of-one / Limited drop callout */}
            {(product.isOneOfOne || product.isLimitedEdition) && !isSoldOut && (
              <div className="p-3.5 bg-[#FFF0F0] border border-[#FFCDD2] rounded-sm text-xs text-[#D32F2F]">
                <div>
                  <strong>Official Limited Release:</strong> This edition is produced in numbered batches for MST Blockchain contributors. Once allocation is claimed, it will not be restocked.
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-stone text-xs sm:text-sm text-[#5C564E] leading-relaxed border-t border-b border-[#E8E2D8] py-4">
              <p>{product.description}</p>
            </div>

            {/* Variant Selector (if applicable) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 bg-white p-4 rounded-sm border border-[#E8E2D8]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                  <span>Select Variant / Size</span>
                  {selectedVariant && (
                    <span className="text-[#7A7268] font-mono text-[11px]">
                      {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : 'Sold out'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isVariantSoldOut = variant.stock <= 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={isVariantSoldOut}
                        className={`px-3 py-1.5 text-xs rounded-sm border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1A1816] text-[#FAF7F2] border-[#1A1816] font-medium'
                            : isVariantSoldOut
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                            : 'bg-[#FAF7F2] text-[#5C564E] border-[#E8E2D8] hover:border-[#FF2D2D]'
                        }`}
                      >
                        {variant.size && <span>{variant.size}</span>}
                        {variant.color && <span className="opacity-70">({variant.color})</span>}
                        {!variant.size && !variant.color && <span>{variant.name || 'Standard'}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            <div className="space-y-3 bg-white p-4 rounded-sm border border-[#E8E2D8]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                <Ruler className="w-4 h-4 text-[#FF2D2D]" />
                <span>Product Specifications & Measurements</span>
              </div>
              <p className="text-[11px] text-[#7A7268]">
                Laid-flat dimensions and verified material construction for this merchandise piece.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F4EFEA]">
                {product.specifications && Array.isArray(product.specifications) ? (
                  product.specifications.map(s => (
                    <div key={s.name} className="flex justify-between py-1 border-b border-stone-100 last:border-b-0">
                      <span className="text-[#7A7268]">{s.name}:</span>
                      <span className="font-medium text-[#1A1816]">{s.value}</span>
                    </div>
                  ))
                ) : product.specifications && typeof product.specifications === 'object' ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-stone-100 last:border-b-0">
                      <span className="capitalize text-[#7A7268]">{key}:</span>
                      <span className="font-medium text-[#1A1816]">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-[#7A7268]">Material:</span>
                      <span className="font-medium text-[#1A1816]">{product.material || 'Organic Ring-Spun Cotton'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-[#7A7268]">Standard Size:</span>
                      <span className="font-medium text-[#1A1816]">{product.standardSize || 'Regular Fit'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quality Transparency */}
            <div className="space-y-2 bg-[#FAF7F2] p-4 rounded-sm border border-[#E8E2D8]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                <ShieldCheck className="w-4 h-4 text-[#FF2D2D]" />
                <span>Authenticity & Quality Guarantee</span>
              </div>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Official MST Blockchain merchandise verified with high-density embroidery, custom labels, and verified durable construction.
              </p>
            </div>

            {/* CTA Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut || isAdding}
                className={`w-full py-4 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 rounded-sm shadow-md transition-all ${
                  isSoldOut
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#1A1816] text-[#FAF7F2] hover:bg-[#FF2D2D]'
                }`}
              >
                {isSoldOut ? (
                  'Sold Out'
                ) : isAdding ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add To Shopping Bag
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWishlist}
                  className={`py-3 text-xs uppercase tracking-wider font-medium border rounded-sm flex items-center justify-center gap-2 transition ${
                    isWishlisted
                      ? 'bg-[#FF2D2D] text-white border-[#FF2D2D]'
                      : 'bg-white text-[#1A1816] border-[#E8E2D8] hover:border-[#FF2D2D]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 text-xs uppercase tracking-wider font-medium border border-[#E8E2D8] bg-white text-[#1A1816] hover:border-[#FF2D2D] rounded-sm flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Shipping & Delivery Policies */}
            <div className="pt-4 border-t border-[#E8E2D8] space-y-2 text-xs text-[#5C564E]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF2D2D]" />
                <span>Complimentary express shipping on orders over ₹2,999</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#FF2D2D]" />
                <span>7-Day Return Window (Unworn in original condition with tags)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Merchandise */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif-editorial text-2xl text-[#1A1816]">
                More From The {product.category.replace('-', ' ').toUpperCase()} Collection
              </h2>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] hover:text-[#FF2D2D] transition"
              >
                View Category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <div key={rel._id} className="bg-white p-3 rounded-sm border border-[#E8E2D8]">
                  <Link href={`/product/${rel.slug}`} className="block relative aspect-3/4 rounded-xs overflow-hidden mb-3 bg-[#F5F0E8]">
                    <Image
                      src={rel.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                      alt={rel.name}
                      fill
                      className="object-cover img-zoom-hover"
                    />
                  </Link>
                  <p className="text-[10px] text-[#7A7268] uppercase tracking-wider font-mono">{rel.brand || 'MST Ecosystem'}</p>
                  <h4 className="font-serif-editorial text-sm font-medium text-[#1A1816] truncate mt-0.5">
                    <Link href={`/product/${rel.slug}`}>{rel.name}</Link>
                  </h4>
                  <p className="font-serif-editorial text-sm font-semibold text-[#1A1816] mt-1">
                    ₹{rel.sellingPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
