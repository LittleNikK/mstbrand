'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2, Star, Zap, Check, Sparkles } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface VariantFormItem {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
}

interface CategoryConfig {
  label: string;
  sizeLabel: string;
  quickPresets: string[];
  helperNote: string;
  suggestedSpecs: { key: string; label: string; placeholder: string }[];
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  apparel: {
    label: 'Apparel (Hoodies & Tees)',
    sizeLabel: 'Clothing Sizing',
    quickPresets: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    helperNote: 'Clothing sizes appear as selectable pills on the storefront product card and product page.',
    suggestedSpecs: [
      { key: 'fit', label: 'Fit Type', placeholder: 'e.g. Oversized Drop-Shoulder / Regular Fit' },
      { key: 'gsm', label: 'Fabric Weight / GSM', placeholder: 'e.g. 400 GSM Heavyweight French Terry' },
      { key: 'care', label: 'Care Instructions', placeholder: 'e.g. Machine wash cold, hang dry' },
    ],
  },
  headwear: {
    label: 'Headwear & Caps',
    sizeLabel: 'Cap / Headwear Sizing',
    quickPresets: ['One Size', 'Snapback', 'S/M', 'L/XL', 'Strapback', 'Fitted 7 1/4', 'Fitted 7 3/8', 'Fitted 7 1/2'],
    helperNote: 'Specify adjustable or fitted sizing options for caps, beanies, and hats.',
    suggestedSpecs: [
      { key: 'profile', label: 'Cap Profile', placeholder: 'e.g. 6-Panel High Profile / Unstructured Dad Cap' },
      { key: 'closure', label: 'Closure Type', placeholder: 'e.g. Metal Buckle / Snapback / Elastic Beanie' },
    ],
  },
  drinkware: {
    label: 'Drinkware & Tumblers',
    sizeLabel: 'Volume & Capacity',
    quickPresets: ['350ml', '500ml', '750ml', '1000ml', '12oz', '16oz', '20oz', '24oz'],
    helperNote: 'Drinkware sizes represent liquid volume/capacity available for this tumbler or mug.',
    suggestedSpecs: [
      { key: 'insulation', label: 'Thermal Retention', placeholder: 'e.g. 24h Cold / 12h Hot (Double-wall vacuum)' },
      { key: 'materials', label: 'Grade of Steel', placeholder: 'e.g. 304 Food-grade Stainless Steel' },
    ],
  },
  'tech-accessories': {
    label: 'Tech Accessories & Desk Mats',
    sizeLabel: 'Dimensions & Form Factor',
    quickPresets: ['Standard (800x300mm)', 'Extended (900x400mm)', 'Desk Mat (1000x500mm)', 'Small', 'Medium', 'Large'],
    helperNote: 'Define mousepad/desk mat dimensions or device sizes (e.g. iPhone 15 Pro, 16 Pro Max).',
    suggestedSpecs: [
      { key: 'thickness', label: 'Thickness / Edge', placeholder: 'e.g. 4mm Anti-fray stitched edge' },
      { key: 'surface', label: 'Glide Surface', placeholder: 'e.g. Micro-woven speed cloth with non-slip base' },
    ],
  },
  bags: {
    label: 'Bags & Sleeves',
    sizeLabel: 'Bag Capacity & Laptop Size',
    quickPresets: ['13-14" Sleeve', '15-16" Sleeve', 'Compact (15L)', 'Daily (22L)', 'Traveler (32L)'],
    helperNote: 'Offer sleeve dimensions or backpack volume options.',
    suggestedSpecs: [
      { key: 'laptopFit', label: 'Laptop Sleeve Fit', placeholder: 'e.g. Fits up to 16-inch MacBook Pro' },
      { key: 'waterproof', label: 'Weatherproofing', placeholder: 'e.g. Water-resistant Cordura ballistic nylon' },
    ],
  },
  goodies: {
    label: 'Goodies & Stickers',
    sizeLabel: 'Pack / Set Options',
    quickPresets: ['Single Piece', '3-Pack', '5-Pack', '10-Pack', 'Collector Bundle'],
    helperNote: 'Offer individual items or bundle pack quantities.',
    suggestedSpecs: [
      { key: 'finish', label: 'Sticker Finish', placeholder: 'e.g. Holographic UV-resistant vinyl' },
    ],
  },
  bundles: {
    label: 'Bundles & Starter Kits',
    sizeLabel: 'Kit / Bundle Tier',
    quickPresets: ['Starter Kit', 'Pro Bundle', 'Collector Edition', 'All-In Genesis Box'],
    helperNote: 'Give customers bundle tier options with distinct merchandise included.',
    suggestedSpecs: [
      { key: 'includes', label: 'What is Included', placeholder: 'e.g. Hoodie + Tumbler + Sticker Pack + Keyring' },
    ],
  },
  collectibles: {
    label: 'Collectibles',
    sizeLabel: 'Edition / Tier',
    quickPresets: ['Standard Edition', 'Limited Edition', 'Genesis Mint #1-100', 'Gold Edition'],
    helperNote: 'Define collectible variants such as numbered editions or finishes.',
    suggestedSpecs: [
      { key: 'editionRun', label: 'Edition Run', placeholder: 'e.g. Limited to 500 units worldwide' },
      { key: 'authenticity', label: 'Verification', placeholder: 'e.g. Embedded NFC Chip + Blockchain Certificate' },
    ],
  },
};

function createVariantId(prefix = 'v'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [categorySpecs, setCategorySpecs] = useState<Record<string, string>>({});

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
    imageFit: 'contain' as 'contain' | 'cover',
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

  const activeCategoryConfig = CATEGORY_CONFIGS[formData.category] || CATEGORY_CONFIGS.apparel;

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
    let url = formData.imageUrlInput.trim();
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
      imageUrlInput: '',
    }));
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

  const handleAddVariant = (defaultSize?: string) => {
    const sizeToUse = defaultSize || '';
    const defaultPrice = Number(formData.sellingPrice) || 0;
    const cleanSize = sizeToUse ? sizeToUse.toUpperCase().replace(/[^A-Z0-9]/g, '') : 'VAR';
    const newVariant: VariantFormItem = {
      id: createVariantId('v'),
      sku: `${formData.sku || 'MST'}-${cleanSize}-${formData.variants.length + 1}`,
      size: sizeToUse || 'M',
      color: formData.color || '',
      stock: 15,
      price: defaultPrice,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleToggleSizePreset = (sizeName: string) => {
    const exists = formData.variants.some(v => v.size === sizeName);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter(v => v.size !== sizeName),
      }));
    } else {
      handleAddVariant(sizeName);
    }
  };

  const handleAddAllSizes = (sizesList: string[]) => {
    const defaultPrice = Number(formData.sellingPrice) || 0;
    setFormData(prev => {
      const existingSizes = new Set(prev.variants.map(v => v.size));
      const newVariants = [...prev.variants];
      sizesList.forEach(s => {
        if (!existingSizes.has(s)) {
          const cleanSize = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
          newVariants.push({
            id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${cleanSize}`,
            sku: `${prev.sku || 'MST'}-${cleanSize}-${newVariants.length + 1}`,
            size: s,
            color: prev.color || '',
            stock: 15,
            price: defaultPrice,
          });
        }
      });
      return { ...prev, variants: newVariants };
    });
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    handleAddVariant(trimmed);
    setCustomSizeInput('');
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
    success(`Updated all variants to ₹${price}`);
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

      // Category-specific specifications
      Object.entries(categorySpecs).forEach(([key, val]) => {
        if (val && val.trim()) {
          const specDef = activeCategoryConfig.suggestedSpecs.find(s => s.key === key);
          const label = specDef ? specDef.label : key;
          specifications.push({ name: label, value: val.trim() });
        }
      });

      const totalStock = formData.variants.length > 0
        ? formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : Number(formData.stock) || 0;

      const sellingPriceNum = Number(formData.sellingPrice);
      const prices = formData.variants.map(v => v.price).filter((p): p is number => typeof p === 'number' && p > 0);
      const hasDifferentiated = prices.length > 1 && new Set(prices).size > 1;
      const syncedVariants = (!hasDifferentiated || formData.variants.length <= 1)
        ? formData.variants.map(v => ({
            ...v,
            price: sellingPriceNum,
            stock: formData.variants.length === 1 ? totalStock : v.stock,
          }))
        : formData.variants.map(v => ({
            ...v,
            price: (v.price && v.price > 0) ? v.price : sellingPriceNum,
          }));

      const allSizes = Array.from(new Set(
        syncedVariants.map(v => v.size).filter((s): s is string => Boolean(s && s.trim()))
      ));

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
        variants: syncedVariants,
        sizes: allSizes,
        imageFit: formData.imageFit || 'contain',
        images: formData.images,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        sellingPrice: Number(formData.sellingPrice),
        referencePrice: formData.referencePrice
          ? Number(formData.referencePrice)
          : (formData.costPrice && Number(formData.costPrice) > Number(formData.sellingPrice) ? Number(formData.costPrice) : undefined),
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
                onChange={e => {
                  const newCat = e.target.value;
                  setFormData(prev => ({ ...prev, category: newCat }));
                  setCategorySpecs({});
                }}
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

        {/* Category-Specific Specifications */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF2D2D]" />
              <h2 className="font-heading text-lg font-bold text-white">
                {activeCategoryConfig.label} Options & Specifications
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#FF2D2D]/10 text-[#FF2D2D] rounded-xs font-bold border border-[#FF2D2D]/20">
              Category Customized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeCategoryConfig.suggestedSpecs.map(spec => (
              <div key={spec.key}>
                <label className="block text-[11px] font-semibold text-white/80 mb-1">{spec.label}</label>
                <input
                  type="text"
                  value={categorySpecs[spec.key] || ''}
                  onChange={e => setCategorySpecs({ ...categorySpecs, [spec.key]: e.target.value })}
                  placeholder={spec.placeholder}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
                />
              </div>
            ))}

            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Dimensions / Physical Size</label>
              <input
                type="text"
                value={formData.specDimensions}
                onChange={e => setFormData({ ...formData, specDimensions: e.target.value })}
                placeholder="e.g. 900mm x 400mm x 4mm"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Weight / Capacity</label>
              <input
                type="text"
                value={formData.specWeight}
                onChange={e => setFormData({ ...formData, specWeight: e.target.value })}
                placeholder="e.g. 750ml / 320g"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Compatibility / Devices</label>
              <input
                type="text"
                value={formData.specCompatibility}
                onChange={e => setFormData({ ...formData, specCompatibility: e.target.value })}
                placeholder="e.g. 13-16 inch Laptops / Universal"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Base Stock */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Pricing & Discounts
              </h2>
              <p className="text-xs text-white/50">
                Set customer selling price and optional MRP to showcase strikethrough discount rates.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">
                Discounted Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.sellingPrice}
                onChange={e => {
                  const val = e.target.value;
                  const newPrice = Number(val);
                  setFormData(prev => {
                    const prevPrice = Number(prev.sellingPrice);
                    const prices = prev.variants.map(v => v.price).filter((p): p is number => typeof p === 'number' && p > 0);
                    const hasDifferentiated = prices.length > 1 && new Set(prices).size > 1;
                    const updatedVariants = (!hasDifferentiated || prev.variants.length <= 1)
                      ? prev.variants.map(v => ({ ...v, price: newPrice || 0 }))
                      : prev.variants.map(v => (v.price === prevPrice || !v.price) ? { ...v, price: newPrice || 0 } : v);
                    return {
                      ...prev,
                      sellingPrice: val,
                      variants: updatedVariants,
                    };
                  });
                }}
                placeholder="2499"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm focus:border-[#FF2D2D] outline-none font-semibold"
              />
              <p className="text-[10px] text-white/40 mt-1">Price customer pays at checkout</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">
                Original MRP / Reference Price (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.referencePrice}
                onChange={e => setFormData({ ...formData, referencePrice: e.target.value })}
                placeholder="3499"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
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
                placeholder="1100"
                className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-2.5 text-xs rounded-sm focus:border-[#FF2D2D] outline-none"
              />
              <p className="text-[10px] text-white/40 mt-1">Your internal production/procurement cost</p>
            </div>
          </div>

          {formData.variants.length === 0 ? (
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
          ) : (
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between text-xs">
              <span className="text-white/60">
                Total Combined Inventory: <strong className="text-white font-mono">{formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)} units</strong> across {formData.variants.length} variant sizes
              </span>
              <button
                type="button"
                onClick={handleSyncPriceToVariants}
                className="text-[11px] text-[#5EEAD4] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sync Base Price (₹{formData.sellingPrice || 0}) to All Variants</span>
              </button>
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

        {/* Dynamic Sizing & Variants Section (Category-Tailored) */}
        <div className="bg-[#161616] p-6 rounded-sm border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5EEAD4]" />
                <h2 className="font-heading text-lg font-bold text-white">
                  {activeCategoryConfig.sizeLabel} & Variants
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {activeCategoryConfig.helperNote}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {formData.category === 'apparel' && (
                <button
                  type="button"
                  onClick={() => handleAddAllSizes(['S', 'M', 'L', 'XL'])}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add S, M, L, XL</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAddVariant()}
                className="px-3.5 py-1.5 bg-[#FF2D2D] hover:bg-[#E02626] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Variant</span>
              </button>
            </div>
          </div>

          {/* Quick Presets for this Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Quick {activeCategoryConfig.sizeLabel} Presets (Click to toggle)
              </label>
              {formData.variants.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, variants: [] }))}
                  className="text-[11px] text-[#FF2D2D] hover:underline cursor-pointer"
                >
                  Clear all variants
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeCategoryConfig.quickPresets.map(preset => {
                const isActive = formData.variants.some(v => v.size === preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleToggleSizePreset(preset)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isActive
                      ? 'bg-white text-black border-2 border-white shadow-xs'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span>{preset}</span>
                    {isActive && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add custom size */}
          <div className="pt-2">
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={customSizeInput}
                onChange={e => setCustomSizeInput(e.target.value)}
                placeholder={`Custom size or variant (e.g. ${formData.category === 'drinkware' ? '650ml' : formData.category === 'apparel' ? 'XXXL' : 'Custom'})`}
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 px-3 py-1.5 text-xs rounded-xs outline-none focus:border-[#FF2D2D]"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xs transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Configured Variants Cards */}
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
                      Pill Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={v.size || ''}
                      onChange={e => handleVariantChange(v.id, 'size', e.target.value)}
                      placeholder="e.g. M / 500ml"
                      className="w-full bg-white/10 border border-white/10 text-white font-bold px-2.5 py-1.5 text-xs rounded-xs focus:border-[#FF2D2D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.price !== undefined ? v.price : (formData.sellingPrice || 0)}
                      onChange={e => handleVariantChange(v.id, 'price', Number(e.target.value))}
                      placeholder={formData.sellingPrice || '0'}
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
                      placeholder={formData.color || 'Black'}
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
              No specific size variants added yet. Click any preset pill above (e.g. {activeCategoryConfig.quickPresets.slice(0, 4).join(', ')}) or add a custom variant to configure sizing pills for this product.
            </div>
          )}
        </div>

        {/* Product Photography & Media */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Product Photography & Media
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Upload image files or add URLs. Click &quot;Set Cover&quot; to choose the main storefront card photo.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer transition">
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

          {/* Add Image via URL */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={formData.imageUrlInput}
              onChange={e => setFormData({ ...formData, imageUrlInput: e.target.value })}
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
              className="px-4 py-2 bg-white/10 hover:bg-[#FF2D2D] text-white text-xs uppercase tracking-wider rounded-xs font-semibold transition whitespace-nowrap cursor-pointer"
            >
              Add Image URL
            </button>
          </div>

          {/* Image Previews */}
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
            className="px-8 py-3.5 bg-[#FF2D2D] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#E02626] transition rounded-sm flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Publishing...' : 'Publish Product To Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}
