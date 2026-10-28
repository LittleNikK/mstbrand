import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MST Store — Official Merchandise & Goodies | MST Blockchain',
  description: 'Official merchandise and goodies storefront for MST Blockchain. Heavyweight hoodies, developer-grade tees, caps, tumblers, and ecosystem gear.',
  keywords: ['MST Store', 'MST Blockchain', 'MST merchandise', 'Web3 goodies', 'developer hoodies', 'blockchain apparel'],
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'MST Store — Official Merchandise & Goodies | MST Blockchain',
    description: 'Official merchandise and goodies storefront for MST Blockchain. Built for builders, crafted for the decentralized future.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'MST Store',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1816] selection:bg-[#FF2D2D] selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AnnouncementBar />
              <Header />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
              <CartDrawer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
