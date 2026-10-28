export type ConditionGrade = 
  | 'New with tags' 
  | 'Excellent' 
  | 'Very good' 
  | 'Good' 
  | 'Fair'
  | 'Official Merch'
  | 'Limited Edition'
  | 'Mint';

export type ProductCategory = 
  | 'apparel'
  | 'headwear'
  | 'drinkware'
  | 'tech-accessories'
  | 'goodies'
  | 'bags'
  | 'bundles'
  | 'stationery'
  | 'collectibles'
  // Legacy categories for backwards compatibility with existing records
  | 'vintage-tees' 
  | 'shirts' 
  | 'denim' 
  | 'jackets' 
  | 'sweatshirts' 
  | 'trousers' 
  | 'dresses' 
  | 'accessories' 
  | 'archive';

export interface ProductMeasurement {
  chest?: string;
  length?: string;
  shoulders?: string;
  sleeve?: string;
  waist?: string;
  inseam?: string;
  rise?: string;
  thigh?: string;
  legOpening?: string;
  [key: string]: string | undefined;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  publicId?: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  name: string;
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
  price?: number;
}

export interface ProductSpecification {
  material?: string;
  weight?: string;
  dimensions?: string;
  careInstructions?: string;
  origin?: string;
  features?: string[];
  compatibility?: string;
  [key: string]: unknown;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  category: ProductCategory;
  brand: string;
  sellingPrice: number;
  referencePrice?: number;
  costPrice?: number;
  stock: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isLimitedEdition?: boolean;
  editionNumber?: string;
  images: ProductImage[];
  collectionIds: string[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification;
  // Optional / backwards-compatible garment fields
  sizeLabel?: string;
  standardSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'OS';
  measurements?: ProductMeasurement;
  color?: string;
  material?: string;
  conditionGrade?: ConditionGrade;
  conditionNotes?: string;
  flaws?: string[];
  isOneOfOne?: boolean;
  provenanceNotes?: string;
  seo?: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  isDefault: boolean;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin';
  avatar?: string;
  phone?: string;
  addresses: Address[];
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  sku?: string;
  variantId?: string;
  selectedVariantId?: string;
  selectedSize?: string;
  selectedColor?: string;
  // Backwards compatibility fields
  sizeLabel?: string;
  conditionGrade?: ConditionGrade | string;
  isOneOfOne?: boolean;
}

export interface Cart {
  _id?: string;
  userId?: string;
  guestId?: string;
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  updatedAt: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  sku?: string;
  selectedVariantId?: string;
  selectedSize?: string;
  selectedColor?: string;
  color?: string;
  // Backwards compatibility fields
  sizeLabel?: string;
  conditionGrade?: ConditionGrade | string;
  isOneOfOne?: boolean;
}

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type OrderFulfillmentStatus = 'unfulfilled' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingFee: number;
  taxAmount: number;
  total: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: 'razorpay' | 'cod' | 'test_mode';
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
  };
  fulfillmentStatus: OrderFulfillmentStatus;
  timeline: OrderTimelineEvent[];
  tracking?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface InventoryMovement {
  _id: string;
  productId: string;
  productName: string;
  delta: number;
  previousStock: number;
  newStock: number;
  type: 'initial' | 'order_reservation' | 'order_cancelled' | 'admin_adjustment' | 'return_restock';
  referenceId?: string;
  reason: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
