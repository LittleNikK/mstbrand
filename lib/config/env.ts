export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'mst_store',
  AUTH_SECRET: process.env.AUTH_SECRET || 'mst-store-dev-secret-at-least-32-chars-long-12345',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'orders@mstblockchain.com',
  BOOTSTRAP_ADMIN_EMAIL: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@mststore.com',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_CURRENCY_SYMBOL: '₹',
  FREE_SHIPPING_THRESHOLD: 2999, // In INR: free shipping above ₹2,999
  DEFAULT_SHIPPING_FEE: 150,     // In INR: standard ₹150 flat shipping
};

export function isRazorpayConfigured(): boolean {
  return (
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key' &&
    Boolean(process.env.RAZORPAY_KEY_SECRET) &&
    process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_placeholder_secret'
  );
}
