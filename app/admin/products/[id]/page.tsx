'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, ExternalLink, Zap, Upload, Star } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface VariantFormItem {
  id: string;
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  stock: number;
  price?: number;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'apparel',
    brand: 'MST Blockchain',
    sku: '',
    color: '',
    material: '',
    sellingPrice: '',
    costPrice: '',
    referencePrice: '',
    stock: '10',
    status: 'published',
    isFeatured: false,
    sizes: [] as string[],
    variants: [] as VariantFormItem[],
    imageFit: 'contain' as 'contain' | 'cover',
    images: [] as { url: string; alt: string; isPrimary: boolean }[],
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    fetch(`/api/admin/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.product) {
          const p = data.product;
          setFormData({
            name: p.name || '',
            slug: p.slug || '',
            description: p.description || '',
            category: p.category || 'apparel',
            brand: p.brand || 'MST Blockchain',
            sku: p.sku || '',
            color: p.color || '',
            material: p.material || '',
            sellingPrice: p.sellingPrice ? String(p.sellingPrice) : '',
            costPrice: p.costPrice ? String(p.costPrice) : '',
            referencePrice: p.referencePrice
              ? String(p.referencePrice)
              : (p.costPrice && Number(p.costPrice) > Number(p.sellingPrice) ? String(p.costPrice) : ''),
            stock: p.stock !== undefined ? String(p.stock) : '10',
            status: p.status || 'published',
            isFeatured: Boolean(p.isFeatured),
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            imageFit: p.imageFit || 'contain',
            variants: Array.isArray(p.variants)
              ? p.variants.map((v: VariantFormItem) => ({
                id: v.id || `var_${Math.random().toString(36).substring(2, 9)}`,
                sku: v.sku || '',
                name: v.name || '',
                size: v.size || '',
                color: v.color || '',
                stock: v.stock !== undefined ? Number(v.stock) : 10,
                price: v.price !== undefined ? Number(v.price) : (p.sellingPrice || 0),
              }))
              : [],
            images: Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', alt: 'Main photo', isPrimary: true }],
          });
        } else {
          error(data.error || 'Failed to load product');
        }
      })
      .catch(() => {
        if (isMounted) error('Network error loading product');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, error]);

  const handleAddVariant = (defaultSize?: string) => {
    const sizeToUse = defaultSize || '';
    const newVariant: VariantFormItem = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sku: `${formData.sku || 'MST'}-${sizeToUse ? sizeToUse.toUpperCase() : 'VAR'}-${formData.variants.length + 1}`,
      name: sizeToUse ? `${formData.name || 'Product'} / ${sizeToUse}` : '',
      size: sizeToUse,
      color: formData.color || '',
      stock: 15,
      price: formData.sellingPrice ? Number(formData.sellingPrice) : 0,
    };

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
      sizes: sizeToUse && !prev.sizes.includes(sizeToUse) ? [...prev.sizes, sizeToUse] : prev.sizes,
    }));
  };

  const handleRemoveVariant = (varId: string) => {
    setFormData(prev => {
      const remaining = prev.variants.filter(v => v.id !== varId);
      const remainingSizes = Array.from(new Set(remaining.map(v => v.size).filter((s): s is string => Boolean(s))));
      return {
        ...prev,
        variants: remaining,
        sizes: remainingSizes.length > 0 ? remainingSizes : prev.sizes,
      };
    });
  };

  const handleVariantChange = (varId: string, field: keyof VariantFormItem, value: string | number) => {
    setFormData(prev => {
      const updatedVariants = prev.variants.map(v => (v.id === varId ? { ...v, [field]: value } : v));
      let updatedSizes = prev.sizes;
      if (field === 'size' && typeof value === 'string' && value.trim()) {
        const unique = Array.from(new Set([...prev.sizes, value.trim()]));
        updatedSizes = unique;
      }
      return {
        ...prev,
        variants: updatedVariants,
        sizes: updatedSizes,
      };
    });
  };

  const handleToggleSizePreset = (sizeName: string) => {
    const exists = formData.variants.some(v => v.size === sizeName);
    if (exists) {
      // Remove variant for this size
      setFormData(prev => {
        const filtered = prev.variants.filter(v => v.size !== sizeName);
        return {
          ...prev,
          variants: filtered,
          sizes: prev.sizes.filter(s => s !== sizeName),
        };
      });
    } else {
      handleAddVariant(sizeName);
    }
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    handleAddVariant(trimmed);
    setCustomSizeInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({
          ...prev,
          images: [
            ...prev.images,
            { url: data.url, alt: `${prev.name || 'Product'} photo`, isPrimary: prev.images.length === 0 },
          ],
        }));
        success('Image uploaded successfully');
      } else {
        error(data.error || 'Upload failed');
      }
    } catch {
      error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    let url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('data:')) {
      url = `https://${url}`;
    }
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        { url, alt: `${prev.name || 'Product'} photo`, isPrimary: prev.images.length === 0 },
      ],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const remaining = prev.images.filter((_, i) => i !== index);
      if (remaining.length > 0 && !remaining.some(img => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return {
        ...prev,
        images: remaining,
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const handleSyncPriceToVariants = () => {
    const price = Number(formData.sellingPrice);
    if (!price || isNaN(price)) {
      error('Please set a valid Selling Price first');
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => ({ ...v, price })),
    }));
    success(`Updated all variant prices to ₹${price}`);
  };

  const handleDeleteProduct = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${formData.name}"? This cannot be undone and will immediately remove the product for all customers.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      success(`Product "${formData.name}" deleted successfully.`);
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      error(msg);
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const totalStock = formData.variants.length > 0
        ? formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : Number(formData.stock) || 0;

      // Extract unique sizes from variants and sizes state
      const allSizes = Array.from(new Set([
        ...formData.sizes,
        ...formData.variants.map(v => v.size).filter((s): s is string => Boolean(s && s.trim())),
      ]));

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        sku: formData.sku,
        color: formData.color,
        material: formData.material,
        imageFit: formData.imageFit || 'contain',
        images: formData.images,
        variants: formData.variants,
        sizes: allSizes,
        sellingPrice: Number(formData.sellingPrice),
        referencePrice: formData.referencePrice
          ? Number(formData.referencePrice)
          : (formData.costPrice && Number(formData.costPrice) > Number(formData.sellingPrice) ? Number(formData.costPrice) : undefined),
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        stock: totalStock,
        status: formData.status,
        isFeatured: formData.isFeatured,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      success(`Product "${formData.name}" updated successfully!`);
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating product';
      error(msg);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        <div className="w-8 h-8 border-2 border-[#FF2D2D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest">Loading Product Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
              Product Editor
            </span>
            <h1 className="font-heading text-2xl font-bold text-white">
              Edit Product & Sizing
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/product/${formData.slug}`}
            target="_blank"
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xs transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Product</span>
          </Link>
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-semibold rounded-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Permanently Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-[#121212] p-6 rounded-sm border border-white/10 space-y-4">
          <h2 className="font-heading text-lg font-bold text-white border-b border-white/10 pb-2">
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white/80 px-3 py-2 text-sm rounded-xs font-mono focus:border-[#FF2D2D] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none"
              >
                <option value="apparel">Apparel</option>
                <option value="headwear">Headwear</option>
                <option value="drinkware">Drinkware</option>
                <option value="goodies">Goodies</option>
                <option value="stationery">Stationery</option>
                <option value="bags">Bags</option>
                <option value="tech-accessories">Tech Accessories</option>
                <option value="collectibles">Collectibles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Stock Quantity (Base Product) *
              </label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Customer Discount Section */}
        <div className="bg-[#121212] p-6 rounded-sm border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Pricing & Customer Discount
              </h2>
              <p className="text-xs text-white/50">
                Configure discounted selling price and original MRP for strikethrough rate on product cards and view pages.
              </p>
            </div>
            {((formData.referencePrice && Number(formData.referencePrice) > Number(formData.sellingPrice)) ||
              (formData.costPrice && !formData.referencePrice && Number(formData.costPrice) > Number(formData.sellingPrice))) &&
              Number(formData.sellingPrice) > 0 && (
              <div className="px-3 py-1 bg-[#FF2D2D]/15 border border-[#FF2D2D]/40 rounded-full text-xs">
                <span className="font-bold text-[#FF2D2D]">
                  {Math.round(((Number(formData.referencePrice || formData.costPrice) - Number(formData.sellingPrice)) / Number(formData.referencePrice || formData.costPrice)) * 100)}% DISCOUNT ACTIVE
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">
                Discounted Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.sellingPrice}
                onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none font-bold"
              />
              <p className="text-[10px] text-white/40 mt-1">Price customer pays at checkout</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">
                Original MRP / Reference Price (₹)
              </label>
              <input
                type="number"
                min={1}
                value={formData.referencePrice}
                onChange={e => setFormData({ ...formData, referencePrice: e.target.value })}
                placeholder="e.g. 5555"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none"
              />
              <p className="text-[10px] text-white/40 mt-1">Shown crossed-out with % OFF badge</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Cost Price (Admin Only / Factory)
              </label>
              <input
                type="number"
                min={0}
                value={formData.costPrice}
                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="Optional"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded-xs focus:border-[#FF2D2D] outline-none"
              />
              <p className="text-[10px] text-white/40 mt-1">Your internal manufacturing cost</p>
            </div>
          </div>
        </div>

        {/* Dynamic Sizing & Variants Section */}
        <div className="bg-[#121212] p-6 rounded-sm border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
                <h2 className="font-heading text-lg font-bold text-white">
                  Dynamic Sizes & Variants (Displayed on Product Page)
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Each size defined here appears dynamically as a pill in the product view with its own price and stock.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {formData.variants.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncPriceToVariants}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-[#5EEAD4]" />
                  <span>Sync Base Price (₹{formData.sellingPrice || 0})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAddVariant()}
                className="px-3.5 py-1.5 bg-[#FF2D2D] hover:bg-[#E02626] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Variant</span>
              </button>
            </div>
          </div>

          {/* Quick Size Toggle Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Quick Size Presets (Click to add or remove variant)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES.map(s => {
                const isActive = formData.variants.some(v => v.size === s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleSizePreset(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isActive
                        ? 'bg-white text-black border-2 border-white shadow-xs'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/30'
                      }`}
                  >
                    <span>{s}</span>
                    {isActive && <span className="text-[10px] text-black/60 font-medium">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add custom size form input */}
          <div className="pt-2">
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={customSizeInput}
                onChange={e => setCustomSizeInput(e.target.value)}
                placeholder="Custom size (e.g. 750ml, UK 9, A5)"
                className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-1.5 text-xs rounded-xs outline-none focus:border-[#FF2D2D]"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xs transition cursor-pointer"
              >
                Add Size
              </button>
            </div>
          </div>

          {/* Variants Table / Cards */}
          {formData.variants.length > 0 ? (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50 block">
                Configured Variants ({formData.variants.length}):
              </span>
              {formData.variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 bg-white/5 border border-white/10 rounded-sm grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
                >
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Size Pill Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={v.size || ''}
                      onChange={e => handleVariantChange(v.id, 'size', e.target.value)}
                      placeholder="e.g. XL"
                      className="w-full bg-white/10 border border-white/10 text-white font-bold px-2.5 py-1.5 text-xs rounded-xs focus:border-[#FF2D2D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Variant Price (₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.price !== undefined ? v.price : formData.sellingPrice}
                      onChange={e => handleVariantChange(v.id, 'price', Number(e.target.value))}
                      placeholder={formData.sellingPrice}
                      className="w-full bg-white/10 border border-white/10 text-white px-2.5 py-1.5 text-xs rounded-xs focus:border-[#FF2D2D] outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={e => handleVariantChange(v.id, 'stock', Number(e.target.value))}
                      className="w-full bg-white/10 border border-white/10 text-white px-2.5 py-1.5 text-xs rounded-xs focus:border-[#FF2D2D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Color (Optional)
                    </label>
                    <input
                      type="text"
                      value={v.color || ''}
                      onChange={e => handleVariantChange(v.id, 'color', e.target.value)}
                      placeholder="Black"
                      className="w-full bg-white/10 border border-white/10 text-white px-2.5 py-1.5 text-xs rounded-xs focus:border-[#FF2D2D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Variant SKU
                    </label>
                    <input
                      type="text"
                      value={v.sku || ''}
                      onChange={e => handleVariantChange(v.id, 'sku', e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white px-2.5 py-1.5 text-xs rounded-xs font-mono focus:border-[#FF2D2D] outline-none"
                    />
                  </div>

                  <div className="flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-2 text-white/40 hover:text-[#FF2D2D] hover:bg-white/5 rounded-xs transition cursor-pointer"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-sm text-center text-xs text-white/50">
              No specific size variants configured. Click a size preset above (XS, S, M, L, XL, XXL) or click &quot;Add Custom Variant&quot; to configure sizing pills.
            </div>
          )}
        </div>

        {/* Media & Photography Section */}
        <div className="bg-[#121212] p-6 rounded-sm border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2D2D]" />
                <h2 className="font-heading text-lg font-bold text-white">
                  Product Photography & Media
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Upload new photos or add image URLs. The cover image will be displayed on the storefront card.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>

          {/* Image Fit & Alignment Property */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/5 border border-white/10 rounded-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white">
                Image Placement & Fit Property
              </label>
              <p className="text-[11px] text-white/50 mt-0.5">
                Automatically centers all images with proper proportion inside product cards & detail views without stretching.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, imageFit: 'contain' }))}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xs border transition cursor-pointer ${
                  formData.imageFit === 'contain'
                    ? 'bg-[#FF2D2D] text-white border-[#FF2D2D] shadow-xs'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                Fit & Center (Default / No Stretch)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, imageFit: 'cover' }))}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xs border transition cursor-pointer ${
                  formData.imageFit === 'cover'
                    ? 'bg-[#FF2D2D] text-white border-[#FF2D2D] shadow-xs'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                Full Bleed (Cover)
              </button>
            </div>
          </div>

          {/* Add via URL */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              placeholder="Paste image URL (e.g. https://images.unsplash.com/... or /uploads/...)"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2 text-xs rounded-xs focus:border-[#FF2D2D] outline-none"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition whitespace-nowrap cursor-pointer"
            >
              Add Image URL
            </button>
          </div>

          {/* Images Grid Previews */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-3/4 border rounded-sm overflow-hidden bg-stone-900 group flex items-center justify-center p-2 ${
                    img.isPrimary ? 'border-[#FF2D2D] ring-1 ring-[#FF2D2D]' : 'border-white/10'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || 'Product Photo'}
                    className={`w-full h-full ${formData.imageFit === 'cover' ? 'object-cover' : 'object-contain object-center'}`}
                  />

                  {/* Primary Cover Badge */}
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 text-[9px] bg-[#FF2D2D] text-white px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold shadow-xs">
                      Cover
                    </span>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-black/70 hover:bg-[#FF2D2D] text-white rounded-xs transition cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="w-full py-1.5 bg-white/20 hover:bg-[#FF2D2D] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Cover</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-sm text-center text-xs text-white/50">
              No images added for this product. Upload an image file or paste an image URL above.
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Deleting Product...' : 'Delete Product Permanently'}</span>
          </button>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#FF2D2D] hover:bg-[#E02626] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF2D2D]/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Product & Sizing'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
