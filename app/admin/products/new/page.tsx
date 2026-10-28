'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface VariantFormItem {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    stock: '25',
    status: 'published',
    isFeatured: false,
    // Specifications
    specDimensions: '',
    specWeight: '',
    specCompatibility: '',
    // Variants
    variants: [] as VariantFormItem[],
    // Images
    imageUrlInput: '',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        alt: 'Front View',
        isPrimary: true,
      },
    ],
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const autoSku = 'MST-' + name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === slug ? slug : prev.slug,
      sku: prev.sku === '' ? autoSku : prev.sku,
    }));
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
            { url: data.url, alt: `${formData.name || 'Product'} photo`, isPrimary: prev.images.length === 0 },
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
    if (!formData.imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        { url: prev.imageUrlInput.trim(), alt: 'Merchandise Photo', isPrimary: prev.images.length === 0 },
      ],
      imageUrlInput: '',
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    const defaultPrice = Number(formData.sellingPrice) || 0;
    const newVariant: VariantFormItem = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sku: `${formData.sku || 'MST'}-VAR-${formData.variants.length + 1}`,
      size: 'M',
      color: formData.color || 'Matte Black',
      stock: 10,
      price: defaultPrice,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleRemoveVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id),
    }));
  };

  const handleVariantChange = (id: string, field: keyof VariantFormItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => (v.id === id ? { ...v, [field]: value } : v)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const specifications = [];
      if (formData.material) specifications.push({ name: 'Material', value: formData.material });
      if (formData.color) specifications.push({ name: 'Color', value: formData.color });
      if (formData.specDimensions) specifications.push({ name: 'Dimensions', value: formData.specDimensions });
      if (formData.specWeight) specifications.push({ name: 'Weight', value: formData.specWeight });
      if (formData.specCompatibility) specifications.push({ name: 'Compatibility', value: formData.specCompatibility });

      const totalStock = formData.variants.length > 0
        ? formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : Number(formData.stock) || 0;

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        sku: formData.sku,
        color: formData.color,
        material: formData.material,
        specifications,
        variants: formData.variants,
        images: formData.images,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        sellingPrice: Number(formData.sellingPrice),
        referencePrice: formData.referencePrice ? Number(formData.referencePrice) : undefined,
        stock: totalStock,
        status: formData.status,
        isFeatured: formData.isFeatured,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      success(`Product "${formData.name}" added to catalog!`);
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating product';
      error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-white/10 bg-[#121212] rounded-xs text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF2D2D]">
              New Product Entry
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Add Official MST Merchandise
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#121212] p-8 rounded-sm border border-white/10 shadow-sm">
        {/* Core Product Info */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-white pb-2 border-b border-white/10">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. MST Blockchain Genesis Edition Hoodie"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="mst-genesis-hoodie"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="apparel">Apparel (Hoodies & Tees)</option>
                <option value="headwear">Headwear & Caps</option>
                <option value="drinkware">Drinkware & Tumblers</option>
                <option value="tech-accessories">Tech Accessories & Desk Mats</option>
                <option value="goodies">Goodies & Stickers</option>
                <option value="bags">Bags & Sleeves</option>
                <option value="bundles">Bundles & Starter Kits</option>
                <option value="collectibles">Collectibles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Brand / Ecosystem *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="MST Blockchain"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Base SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="MST-GEN-HD-01"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Stealth Black / MST Red"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Material / Finish
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={e => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. 400 GSM Heavyweight Organic French Terry"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe official merchandise specs, builder branding, and craftsmanship..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-3.5 py-2.5 text-xs rounded-sm focus:outline-none focus:border-[#FF2D2D]"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="font-heading text-lg font-bold text-white pb-2 border-b border-white/10">
            Technical Specifications (Optional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Dimensions / Size</label>
              <input
                type="text"
                value={formData.specDimensions}
                onChange={e => setFormData({ ...formData, specDimensions: e.target.value })}
                placeholder="900mm x 400mm x 4mm"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Weight / Capacity</label>
              <input
                type="text"
                value={formData.specWeight}
                onChange={e => setFormData({ ...formData, specWeight: e.target.value })}
                placeholder="750ml / 320g"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Compatibility</label>
              <input
                type="text"
                value={formData.specCompatibility}
                onChange={e => setFormData({ ...formData, specCompatibility: e.target.value })}
                placeholder="13-16 inch Laptops"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="font-heading text-lg font-bold text-white pb-2 border-b border-white/10">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.sellingPrice}
                onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="2499"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Cost Price (Admin Only)
              </label>
              <input
                type="number"
                min={0}
                value={formData.costPrice}
                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="1100"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Reference / MRP Value (Optional)
              </label>
              <input
                type="number"
                min={0}
                value={formData.referencePrice}
                onChange={e => setFormData({ ...formData, referencePrice: e.target.value })}
                placeholder="3499"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm"
              />
            </div>
          </div>

          {formData.variants.length === 0 && (
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Stock Quantity (Base Product) *
              </label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                className="w-48 bg-white/5 border border-white/10 text-white px-3.5 py-2 text-xs rounded-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded-xs accent-[#FF2D2D]"
              />
              <span>Feature on Storefront Homepage</span>
            </label>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Product Variants (Size / Color)
              </h2>
              <p className="text-xs text-white/50">
                Optional: Add specific variants if this product comes in multiple sizes or colors.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          {formData.variants.length > 0 ? (
            <div className="space-y-3">
              {formData.variants.map((v) => (
                <div key={v.id} className="p-3 bg-white/5 border border-white/10 rounded-sm grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Variant SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={e => handleVariantChange(v.id, 'sku', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs rounded-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Size</label>
                    <input
                      type="text"
                      value={v.size || ''}
                      onChange={e => handleVariantChange(v.id, 'size', e.target.value)}
                      placeholder="M / L / XL"
                      className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Color</label>
                    <input
                      type="text"
                      value={v.color || ''}
                      onChange={e => handleVariantChange(v.id, 'color', e.target.value)}
                      placeholder="Black"
                      className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={e => handleVariantChange(v.id, 'stock', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={v.price}
                      onChange={e => handleVariantChange(v.id, 'price', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs rounded-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-2 text-white/40 hover:text-[#FF2D2D] transition"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 italic">
              No variants defined. This product will be listed as a standard single-stock merchandise unit.
            </p>
          )}
        </div>

        {/* Media & Photography */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="font-heading text-lg font-bold text-white pb-2 border-b border-white/10">
            Product Photography
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                Add Image via URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imageUrlInput}
                  onChange={e => setFormData({ ...formData, imageUrlInput: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-white/5 border border-white/10 text-white px-3.5 py-2 text-xs rounded-sm"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs uppercase tracking-wider rounded-sm font-semibold transition"
                >
                  Add Image
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                Upload Image File
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs uppercase tracking-wider rounded-sm cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Browse Local Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Image Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative aspect-3/4 border border-white/10 rounded-sm overflow-hidden bg-stone-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-xs hover:bg-[#FF2D2D] transition"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {img.isPrimary && (
                  <span className="absolute bottom-2 left-2 text-[9px] bg-[#FF2D2D] text-white px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/admin/products"
            className="text-xs uppercase tracking-wider text-white/50 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-[#FF2D2D] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#E02626] transition rounded-sm flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Product To Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}
