'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode: string;
  shippingFee: number;
  total: number;
  totalItemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariantId?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  removeItem: (productId: string, selectedVariantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariantId?: string) => void;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
  clearCart: () => void;
  freeShippingProgress: number; // percentage towards ₹2,999 threshold
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_ID_KEY = 'mst_store_guest_id';
const CART_STORAGE_KEY = 'mst_store_bag_items';
const LEGACY_STORAGE_KEY = 'second_story_bag_items';
const DISCOUNT_STORAGE_KEY = 'mst_store_discount';
const LEGACY_DISCOUNT_KEY = 'second_story_discount';
const FREE_SHIPPING_LIMIT = 2999;
const STANDARD_SHIPPING_FEE = 150;

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage safely on mount without synchronous effect setState error
  useEffect(() => {
    let mounted = true;
    const loadSaved = () => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored && mounted) {
          setItems(JSON.parse(stored));
        }
        const storedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY) || localStorage.getItem(LEGACY_DISCOUNT_KEY);
        if (storedDiscount && mounted) {
          setDiscountCode(storedDiscount);
        }
      } catch {
        // Ignore parse errors
      } finally {
        if (mounted) setIsInitialized(true);
      }
    };
    loadSaved();
    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage and sync with server
  const syncWithServer = useCallback(async (currentItems: CartItem[], code?: string) => {
    try {
      const guestId = getOrCreateGuestId();
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedVariantId: i.selectedVariantId,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor,
          })),
          guestId,
          discountCode: code || undefined,
        }),
      });
    } catch {
      // Offline / error tolerance
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    if (discountCode) {
      localStorage.setItem(DISCOUNT_STORAGE_KEY, discountCode);
    } else {
      localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    }
    syncWithServer(items, discountCode);
  }, [items, discountCode, isInitialized, syncWithServer]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = (subtotal === 0 || discountedSubtotal >= FREE_SHIPPING_LIMIT) ? 0 : STANDARD_SHIPPING_FEE;
  const total = discountedSubtotal + shippingFee;
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100));

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (
    product: Product,
    quantity = 1,
    selectedVariantId?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setItems(prev => {
      const existing = prev.find(
        item => item.productId === product._id && item.selectedVariantId === selectedVariantId
      );

      let availableStock = product.stock;
      let price = product.sellingPrice;
      let sku = product.sku;

      if (selectedVariantId && product.variants) {
        const v = product.variants.find(varItem => varItem.id === selectedVariantId);
        if (v) {
          availableStock = v.stock;
          if (v.price) price = v.price;
          if (v.sku) sku = v.sku;
        }
      }

      if (existing) {
        if (product.isOneOfOne) return prev;
        const newQty = Math.min(availableStock, existing.quantity + quantity);
        return prev.map(item =>
          item.productId === product._id && item.selectedVariantId === selectedVariantId
            ? { ...item, quantity: newQty }
            : item
        );
      }

      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        brand: product.brand || 'MST Blockchain',
        sizeLabel: selectedSize || product.sizeLabel || 'Standard',
        price,
        image: product.images?.[0]?.url || '/placeholder.png',
        quantity: product.isOneOfOne ? 1 : Math.min(availableStock, quantity),
        maxStock: availableStock,
        sku,
        selectedVariantId,
        selectedSize: selectedSize || product.sizeLabel,
        selectedColor: selectedColor || product.color,
        conditionGrade: product.conditionGrade || 'Official Merch',
        isOneOfOne: Boolean(product.isOneOfOne),
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeItem = (productId: string, selectedVariantId?: string) => {
    setItems(prev =>
      prev.filter(
        item => !(item.productId === productId && (selectedVariantId ? item.selectedVariantId === selectedVariantId : true))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedVariantId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId && (!selectedVariantId || item.selectedVariantId === selectedVariantId)) {
          if (item.isOneOfOne) return item;
          return { ...item, quantity: Math.min(item.maxStock, quantity) };
        }
        return item;
      })
    );
  };

  const applyDiscount = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a discount code' };
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedVariantId: i.selectedVariantId,
          })),
          discountCode: code.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.calculation) {
        return { success: false, message: data.error || 'Invalid promotional code' };
      }

      if (data.calculation.discountAmount > 0) {
        setDiscountCode(code.trim().toUpperCase());
        setDiscountAmount(data.calculation.discountAmount);
        return {
          success: true,
          message: `Code applied: Saved ₹${data.calculation.discountAmount.toLocaleString('en-IN')}`,
        };
      } else {
        return {
          success: false,
          message: 'Code is not eligible or minimum order amount has not been met.',
        };
      }
    } catch {
      return { success: false, message: 'Failed to apply coupon. Try again.' };
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    setDiscountAmount(0);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DISCOUNT_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        discountAmount,
        discountCode,
        shippingFee,
        total,
        totalItemCount,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        applyDiscount,
        removeDiscount,
        clearCart,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
