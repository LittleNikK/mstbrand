'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Share2,
  Ruler,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Plus,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

function RelatedProductCard({ rel }: { rel: Product }) {
  const { success } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Single primary image stretched properly
  const image = rel.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    try {
      await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: rel._id }),
      });
      success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch {
      setIsWishlisted(isWishlisted);
    }
  };

  return (
    <div className="flex-none w-[220px] sm:w-[260px] lg:w-[280px] flex flex-col group select-none">
      {/* Outer Card Box: Image centered properly and never stretched */}
      <div className="relative aspect-[4/5] bg-[#F8F5F0] rounded-2xl border border-stone-200/90 transition-all duration-300 hover:shadow-md hover:border-stone-300 flex items-center justify-center p-3">
        <Link href={`/product/${rel.slug}`} className="block relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
          <Image
            src={image}
            alt={rel.name}
            fill
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 280px"
            className={`${rel.imageFit === 'cover' ? 'object-cover' : 'object-contain object-center'} p-2 group-hover:scale-105 transition-transform duration-300`}
          />
        </Link>

        {/* Top Right: Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/85 backdrop-blur-xs text-stone-500 hover:text-black hover:bg-white transition cursor-pointer shadow-2xs"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-black text-black' : 'text-stone-500 stroke-[1.5]'
              }`}
          />
        </button>

        {/* Bottom Right: Floating '+' Button that opens product detail */}
        <Link
          href={`/product/${rel.slug}`}
          aria-label={`View ${rel.name} details`}
          className="absolute -bottom-3.5 right-3 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white border border-stone-200 rounded-xl shadow-xs flex items-center justify-center text-stone-700 hover:border-black hover:text-black hover:shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[1.75]" />
        </Link>
      </div>

      {/* Info Section Below Card */}
      <div className="mt-4 sm:mt-4.5 px-0.5">
        <Link href={`/product/${rel.slug}`}>
          <h3 className="text-xs sm:text-[13px] text-stone-800 font-normal hover:text-black transition truncate">
            {rel.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
          <span className="text-xs sm:text-sm font-semibold text-stone-900">
            ₹{rel.sellingPrice.toLocaleString('en-IN')}
          </span>
          {rel.referencePrice && rel.referencePrice > rel.sellingPrice && (
            <span className="text-[10px] sm:text-[11px] text-stone-400 line-through">
              ₹{rel.referencePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  initialLikeCount?: number;
  initialIsWishlisted?: boolean;
}

export default function ProductDetailView({
  product,
  relatedProducts,
  initialLikeCount = 0,
  initialIsWishlisted = false,
}: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { success } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [isAdding, setIsAdding] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<'in' | 'cm'>('in');

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      setCanScroll(maxScroll > 15);
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [relatedProducts]);

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Sync fresh like count and wishlist status from API
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/wishlist?productId=${product._id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (typeof data.count === 'number') {
            setLikeCount(data.count);
          }
          if (typeof data.isWishlisted === 'boolean') {
            setIsWishlisted(data.isWishlisted);
          }
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [product._id]);

  const isNotOneSize = (s?: string) => {
    if (!s) return false;
    const norm = s.trim().toUpperCase();
    return norm !== 'OS' && norm !== 'ONE SIZE' && norm !== 'ONE-SIZE' && norm !== 'O/S' && norm !== 'STANDARD' && norm !== 'PRO';
  };

  // Dynamic sizes derived strictly from actual product variants or sizes configured in admin
  const availableSizes = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const variantSizes = product.variants
        .map(v => v.size)
        .filter((s): s is string => Boolean(s && s.trim() && isNotOneSize(s)));
      if (variantSizes.length > 0) {
        return Array.from(new Set(variantSizes));
      }
    }
    if (product.sizes && product.sizes.length > 0) {
      const cleanSizes = product.sizes.filter(s => Boolean(s && s.trim() && isNotOneSize(s)));
      if (cleanSizes.length > 0) {
        return cleanSizes;
      }
    }
    return [];
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (product.variants && product.variants.length > 0) {
      const validVar = product.variants.find(v => isNotOneSize(v.size));
      if (validVar?.size) return validVar.size;
    }
    return availableSizes[0] || '';
  });

  // Only match variant if selectedSize explicitly matches, never fall back to arbitrary variants
  const selectedVariant = selectedSize && product.variants?.length
    ? product.variants.find(v => v.size === selectedSize)
    : undefined;

  const getPriceForSize = (size: string) => {
    const variant = product.variants?.find(v => v.size === size);
    if (variant && typeof variant.price === 'number' && variant.price > 0) {
      return variant.price;
    }
    return product.sellingPrice;
  };

  const isHoodie = useMemo(() => {
    const text = `${product.name} ${product.slug} ${(product.tags || []).join(' ')}`.toLowerCase();
    return text.includes('hoodie') || text.includes('hoddie') || text.includes('sweatshirt');
  }, [product]);

  const apparelSizes = useMemo(() => {
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    if (availableSizes.length > 0) {
      const set = new Set([...availableSizes, ...defaultSizes]);
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
      return Array.from(set).sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    return defaultSizes;
  }, [availableSizes]);

  const getApparelSpecs = (size: string, unit: 'in' | 'cm') => {
    const norm = size.trim().toUpperCase();

    const hoodieInches: Record<string, { chest: number; length: number; shoulder: number; sleeve: number }> = {
      XS: { chest: 38, length: 26, shoulder: 17.5, sleeve: 24.0 },
      S: { chest: 40, length: 27, shoulder: 18.5, sleeve: 25.0 },
      M: { chest: 42, length: 28, shoulder: 19.5, sleeve: 26.0 },
      L: { chest: 45, length: 29, shoulder: 20.5, sleeve: 27.0 },
      XL: { chest: 48, length: 30, shoulder: 21.5, sleeve: 28.0 },
      XXL: { chest: 51, length: 31, shoulder: 22.5, sleeve: 29.0 },
      '2XL': { chest: 51, length: 31, shoulder: 22.5, sleeve: 29.0 },
      '3XL': { chest: 54, length: 32, shoulder: 23.5, sleeve: 30.0 },
    };

    const teeInches: Record<string, { chest: number; length: number; shoulder: number; sleeve: number }> = {
      XS: { chest: 36, length: 26.5, shoulder: 16.5, sleeve: 8.0 },
      S: { chest: 38, length: 27.5, shoulder: 17.5, sleeve: 8.5 },
      M: { chest: 40, length: 28.5, shoulder: 18.5, sleeve: 9.0 },
      L: { chest: 42, length: 29.5, shoulder: 19.5, sleeve: 9.5 },
      XL: { chest: 44, length: 30.5, shoulder: 20.5, sleeve: 10.0 },
      XXL: { chest: 47, length: 31.5, shoulder: 21.5, sleeve: 10.5 },
      '2XL': { chest: 47, length: 31.5, shoulder: 21.5, sleeve: 10.5 },
      '3XL': { chest: 50, length: 32.5, shoulder: 22.5, sleeve: 11.0 },
    };

    const table = isHoodie ? hoodieInches : teeInches;
    const match = table[norm] || { chest: 40, length: 28, shoulder: 18.5, sleeve: 9.0 };

    if (unit === 'cm') {
      return {
        chest: `${Math.round(match.chest * 2.54)} cm`,
        length: `${Math.round(match.length * 2.54)} cm`,
        shoulder: `${Math.round(match.shoulder * 2.54)} cm`,
        sleeve: `${Math.round(match.sleeve * 2.54)} cm`,
      };
    }

    return {
      chest: `${match.chest}"`,
      length: `${match.length}"`,
      shoulder: `${match.shoulder}"`,
      sleeve: `${match.sleeve}"`,
    };
  };

  const effectivePrice = (selectedVariant && typeof selectedVariant.price === 'number' && selectedVariant.price > 0)
    ? selectedVariant.price
    : product.sellingPrice;

  // Resolve reference/MRP price: check explicit referencePrice, or fallback to costPrice if costPrice was entered as MRP
  const rawReference = (product.referencePrice && product.referencePrice > 0)
    ? product.referencePrice
    : (product.costPrice && product.costPrice > effectivePrice ? product.costPrice : null);

  const hasReferencePrice = Boolean(rawReference && rawReference > effectivePrice);
  const referencePrice = hasReferencePrice ? rawReference : null;
  const effectiveStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
  const isSoldOut = effectiveStock <= 0;

  const discountPercent = hasReferencePrice && referencePrice
    ? Math.round(((referencePrice - effectivePrice) / referencePrice) * 100)
    : 0;

  const formattedLikeCount = likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : `${likeCount}`;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', alt: product.name, isPrimary: true }];

  const currentImage = images[activeImageIndex] || images[0];

  const handleAddToCart = () => {
    if (isSoldOut) return;
    setIsAdding(true);
    addItem(product, 1, selectedVariant?.id);
    success(`"${product.name}" (${selectedSize}) added to your bag.`);
    openCart();
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addItem(product, 1, selectedVariant?.id);
    router.push('/checkout');
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard');
    }
  };

  const handleWishlist = async () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    setLikeCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/wishlist${!nextState ? `?productId=${product._id}` : ''}`, {
        method: nextState ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof data.count === 'number') {
          setLikeCount(data.count);
        }
        if (typeof data.isWishlisted === 'boolean') {
          setIsWishlisted(data.isWishlisted);
        }
        success(nextState ? 'Saved to your wishlist' : 'Removed from wishlist');
      } else {
        setIsWishlisted(!nextState);
        setLikeCount(prev => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch {
      setIsWishlisted(!nextState);
      setLikeCount(prev => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
          {/* LEFT SECTION: Thumbnails + Main Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
            {/* Vertical Thumbnails Sidebar */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 shrink-0 w-full md:w-20">
              {images.map((img, idx) => (
                <button
                  key={img.url + idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden bg-white/25 backdrop-blur-md border-2 transition-all p-1 shadow-xs cursor-pointer ${activeImageIndex === idx
                    ? 'border-black ring-1 ring-black'
                    : 'border-stone-200/60 hover:border-stone-400 opacity-80 hover:opacity-100'
                    }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image Frame - dynamic sizing with safe area */}
            <div className="relative flex-1 w-full bg-white/25 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-stone-200/50 p-4 sm:p-6 shadow-xs flex items-center justify-center overflow-hidden">
              {/* TOP RIGHT: The 3 Action Icons (Share, Specs & Size Guide, Wishlist with dynamic live counter) */}
              <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-3">
                {/* 1. Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full text-stone-700 hover:text-black hover:bg-stone-100/60 transition cursor-pointer"
                  title="Share this product"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 stroke-[1.75]" />
                </button>

                {/* 2. Specs & Size Guide Button */}
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="p-2 rounded-full text-stone-700 hover:text-black hover:bg-stone-100/60 transition cursor-pointer"
                  title="View Specs & Size Guide"
                  aria-label="Size Guide"
                >
                  <Layers className="w-5 h-5 stroke-[1.75]" />
                </button>

                {/* 3. Wishlist Button with actual dynamic like count */}
                <button
                  onClick={handleWishlist}
                  className="flex flex-col items-center text-stone-700 hover:text-[#FF2D2D] transition cursor-pointer group"
                  aria-label="Wishlist"
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 transition stroke-[1.75] ${isWishlisted ? 'fill-[#FF2D2D] text-[#FF2D2D]' : 'group-hover:text-[#FF2D2D]'
                      }`}
                  />
                  <span className="text-[11px] font-medium text-stone-600 mt-0.5">
                    {formattedLikeCount}
                  </span>
                </button>
              </div>

              {/* Center Main Product Image: Perfectly centered in viewport frame, never stretched */}
              <div className="relative w-full aspect-square sm:aspect-4/3 max-h-[560px] xl:max-h-[620px] flex items-center justify-center p-2 sm:p-4">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`${product.imageFit === 'cover' ? 'object-cover' : 'object-contain object-center'} p-2 sm:p-4 transition-transform duration-300 hover:scale-105`}
                />
              </div>

              {/* Sold Out Overlay */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-30">
                  <span className="px-6 py-2.5 bg-white text-[#1A1816] text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl border border-stone-200">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Details, Pricing, Size Selector & Checkout Action Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card 1: Category & Title Card */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl border border-stone-200/50 p-5 sm:p-6 shadow-xs">
              <div className="text-xs font-medium text-stone-600 capitalize">
                {product.category.replace('-', ' ')}
              </div>
              <h1 className="font-sans text-xl sm:text-2xl font-bold text-[#1A1816] tracking-tight mt-1.5 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Card 2: Size Selector, Price, Cashback & Actions Card (Exact match to reference image) */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl border border-stone-200/50 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Size Selector Header & Pills (Only displayed if product has actual sizing) */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-3">
                    <span className="text-stone-700">
                      Selected: <span className="text-black font-bold">{selectedSize}</span>
                    </span>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-stone-900 hover:text-black flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="underline underline-offset-4">Size Guide</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Size Pills Row */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {availableSizes.map(size => {
                      const isSelected = selectedSize === size;
                      const sizePrice = getPriceForSize(size);
                      return isSelected ? (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className="px-4 py-1.5 rounded-2xl border-2 border-black bg-white flex flex-col items-center justify-center min-w-[68px] min-h-[52px] shadow-xs cursor-pointer transition"
                        >
                          <span className="text-sm font-bold text-black leading-none">{size}</span>
                          <span className="text-xs text-stone-700 font-medium mt-1">
                            ₹{sizePrice.toLocaleString('en-IN')}
                          </span>
                        </button>
                      ) : (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className="px-4 py-2.5 rounded-2xl border border-stone-200/90 bg-white hover:border-stone-400 text-sm font-semibold text-stone-900 min-w-[58px] min-h-[52px] flex items-center justify-center transition cursor-pointer shadow-xs"
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}



              {/* Price & Savings Row (Directly from Admin) */}
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1816]">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {referencePrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{referencePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#EBF0FF] text-[#2563EB] text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <span>↓</span>
                    <span>{discountPercent}%</span>
                  </span>
                )}
              </div>



              {/* Buy Now & Add To Cart Side-by-Side Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleBuyNow}
                  disabled={isSoldOut}
                  className="flex-1 py-3.5 sm:py-4 px-6 bg-[#EFEFEF]/80 hover:bg-stone-200 text-[#1A1816] font-semibold text-sm rounded-xl transition text-center shadow-xs cursor-pointer active:scale-98"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut || isAdding}
                  className="flex-1 py-3.5 sm:py-4 px-6 bg-[#1A1816] hover:bg-[#FF2D2D] text-white font-semibold text-sm rounded-xl transition text-center shadow-sm cursor-pointer active:scale-98"
                >
                  {isAdding ? 'Added to Bag ✓' : 'Add To Cart'}
                </button>
              </div>

              {/* Trust Footer Line */}
              <div className="text-[11px] text-stone-500 text-center pt-1 border-t border-stone-100">
                7-Day Hassle-Free Returns • 100% Verified
              </div>
            </div>

            {/* Card 3: Technical Specifications & Overview */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl border border-stone-200/50 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1816]">
                <Ruler className="w-4 h-4 text-[#FF2D2D]" />
                <span>Product Specifications</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed font-normal">
                {product.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                {(product.specifications?.material || product.material) && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-700 font-semibold">Material:</span>
                    <span className="font-medium text-[#1A1816] truncate ml-1">{product.specifications?.material || product.material}</span>
                  </div>
                )}
                {product.specifications?.dimensions && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-700 font-semibold">Dimensions:</span>
                    <span className="font-medium text-[#1A1816] truncate ml-1">{product.specifications.dimensions}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-700 font-semibold">Stock:</span>
                  <span className="font-medium text-[#1A1816]">{effectiveStock > 0 ? `${effectiveStock} in stock` : 'Out of stock'}</span>
                </div>
                {selectedSize && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-700 font-semibold">Selected Size:</span>
                    <span className="font-medium text-[#1A1816]">{selectedSize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#1A1816]">
                More From The {product.category.replace('-', ' ').toUpperCase()} Collection
              </h2>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] hover:text-[#FF2D2D] transition"
              >
                View Category
              </Link>
            </div>
            {/* Horizontal Scroll Carousel */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-7 pt-2 px-1 scroll-smooth"
            >
              {relatedProducts.map(rel => (
                <RelatedProductCard key={rel._id} rel={rel} />
              ))}
            </div>

            {/* Slider Navigation Bar: Only rendered when needed to scroll more cards */}
            {canScroll && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4">
                <button
                  onClick={() => scrollCarousel('left')}
                  aria-label="Previous Products"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 hover:border-black hover:text-black transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-36 sm:w-64 h-0.5 bg-stone-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-stone-500 rounded-full transition-all duration-150"
                    style={{ width: `${Math.max(20, Math.min(100, scrollProgress))}%` }}
                  />
                </div>
                <button
                  onClick={() => scrollCarousel('right')}
                  aria-label="Next Products"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 hover:border-black hover:text-black transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Size & Specification Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 relative shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-black p-2 rounded-full cursor-pointer transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pr-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                  <Ruler className="w-4 h-4 text-[#FF2D2D]" />
                  <span>Size & Fit Guide</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1816] mt-0.5">
                  {product.name}
                </h3>
              </div>

              {/* Unit Toggle for Sizing */}
              {product.category !== 'drinkware' && product.category !== 'headwear' && (
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSizeGuideUnit('in')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${sizeGuideUnit === 'in'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-stone-500 hover:text-black'
                      }`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeGuideUnit('cm')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${sizeGuideUnit === 'cm'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-stone-500 hover:text-black'
                      }`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              )}
            </div>

            {/* Size Table: Drinkware, Headwear, or Full Proper Sizing Guide */}
            {product.category === 'drinkware' ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5">Size / Volume</th>
                        <th className="py-3 px-3.5">Capacity</th>
                        <th className="py-3 px-3.5">Height</th>
                        <th className="py-3 px-3.5">Diameter</th>
                        <th className="py-3 px-3.5">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {[
                        { size: '350ml', capacity: '350 ml (11.8 oz)', height: '10.5 cm (4.1")', diameter: '8.2 cm (3.2")', weight: '~320 g' },
                        { size: '500ml', capacity: '500 ml (16.9 oz)', height: '22.5 cm (8.8")', diameter: '7.0 cm (2.7")', weight: '~350 g' },
                        { size: '750ml', capacity: '750 ml (25.4 oz)', height: '26.5 cm (10.4")', diameter: '7.8 cm (3.0")', weight: '~390 g' },
                      ].map(row => {
                        const isCurrent = selectedSize === row.size;
                        return (
                          <tr
                            key={row.size}
                            onClick={() => setSelectedSize(row.size)}
                            className={`cursor-pointer transition hover:bg-stone-50 ${isCurrent ? 'bg-[#F0F5FF] font-bold text-black border-l-4 border-black' : ''
                              }`}
                          >
                            <td className="py-3 px-3.5">
                              <span className="font-extrabold">{row.size}</span>
                              {isCurrent && (
                                <span className="ml-1.5 text-[10px] bg-black text-white px-1.5 py-0.5 rounded-sm font-semibold">
                                  Selected
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5">{row.capacity}</td>
                            <td className="py-3 px-3.5">{row.height}</td>
                            <td className="py-3 px-3.5">{row.diameter}</td>
                            <td className="py-3 px-3.5">{row.weight}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : product.category === 'headwear' ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5">Size</th>
                        <th className="py-3 px-3.5">Head Circumference</th>
                        <th className="py-3 px-3.5">Crown Depth</th>
                        <th className="py-3 px-3.5">Brim Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {[
                        { size: 'Adjustable', circ: '54 - 60 cm (21.2" - 23.6")', depth: '12 cm (4.7")', brim: '7.0 cm (2.7")' },
                        { size: 'Fitted S/M', circ: '55 - 58 cm (21.6" - 22.8")', depth: '12 cm (4.7")', brim: '7.0 cm (2.7")' },
                        { size: 'Fitted L/XL', circ: '58 - 62 cm (22.8" - 24.4")', depth: '13 cm (5.1")', brim: '7.0 cm (2.7")' },
                      ].map(row => {
                        const isCurrent = selectedSize === row.size;
                        return (
                          <tr
                            key={row.size}
                            onClick={() => setSelectedSize(row.size)}
                            className={`cursor-pointer transition hover:bg-stone-50 ${isCurrent ? 'bg-[#F0F5FF] font-bold text-black border-l-4 border-black' : ''
                              }`}
                          >
                            <td className="py-3 px-3.5">
                              <span className="font-extrabold">{row.size}</span>
                              {isCurrent && (
                                <span className="ml-1.5 text-[10px] bg-black text-white px-1.5 py-0.5 rounded-sm font-semibold">
                                  Selected
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5">{row.circ}</td>
                            <td className="py-3 px-3.5">{row.depth}</td>
                            <td className="py-3 px-3.5">{row.brim}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Full Proper Sizing Guide */
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5">Size</th>
                        <th className="py-3 px-3.5">Chest / Bust</th>
                        <th className="py-3 px-3.5">Body Length</th>
                        <th className="py-3 px-3.5">Shoulder</th>
                        <th className="py-3 px-3.5">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {apparelSizes.map(size => {
                        const isCurrent = selectedSize === size;
                        const specs = getApparelSpecs(size, sizeGuideUnit);
                        return (
                          <tr
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`cursor-pointer transition hover:bg-stone-50 ${isCurrent
                              ? 'bg-[#F0F5FF] font-bold text-black border-l-4 border-black'
                              : ''
                              }`}
                          >
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold">{size}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-sm font-semibold">
                                    Selected
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3.5">{specs.chest}</td>
                            <td className="py-3 px-3.5">{specs.length}</td>
                            <td className="py-3 px-3.5">{specs.shoulder}</td>
                            <td className="py-3 px-3.5">{specs.sleeve}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* How to Measure Guidance Card */}
                <div className="p-3.5 bg-stone-50 border border-stone-200/70 rounded-2xl text-[11px] text-stone-600 space-y-1.5">
                  <div className="font-bold text-black uppercase tracking-wider text-[10px]">
                    How To Measure:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    <div>
                      <strong className="text-black font-semibold">1. Chest:</strong> Measure around the fullest chest circumference keeping tape level.
                    </div>
                    <div>
                      <strong className="text-black font-semibold">2. Length:</strong> From highest shoulder point down to bottom hem.
                    </div>
                    <div>
                      <strong className="text-black font-semibold">3. Shoulder:</strong> Across the back from shoulder tip to shoulder tip.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="w-full py-3.5 bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-[#FF2D2D] transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
