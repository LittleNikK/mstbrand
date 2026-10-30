'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Store,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemCount, openCart } = useCart();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'Apparel', href: '/shop?category=apparel' },
    { name: 'Goodies & Merch', href: '/shop?category=goodies' },
    { name: 'Hampers & Mystery', href: '/shop?category=bundles' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-[#E8E2D8] py-2 sm:py-2.5 shadow-xs'
            : 'bg-[#FAF7F2] border-[#E8E2D8] py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between gap-1 sm:gap-4">
            {/* Left: Mobile menu button + Brand Wordmark */}
            <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 -ml-1.5 lg:hidden text-[#1A1816] hover:text-[#FF2D2D] transition shrink-0"
                aria-label="Open navigation menu"
                suppressHydrationWarning
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="inline-flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <Image
                  src="/logo.png"
                  alt="MST Brand Logo"
                  width={30}
                  height={30}
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <span className="font-serif-editorial text-lg sm:text-2xl font-medium tracking-tight text-[#1A1816] group-hover:text-[#FF2D2D] transition whitespace-nowrap">
                  MST Brand
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest font-medium transition-colors hover:text-[#FF2D2D] ${
                      isActive ? 'text-[#FF2D2D] font-semibold' : 'text-[#5C564E]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Items: Search Input Box + User + Heart + Store + Cart */}
            <div className="flex items-center gap-1 sm:gap-3 md:gap-5 shrink-0">
              {/* Search Box (Exact match to reference image: crisp rectangular outline with Search icon inside on the right) */}
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-36 md:w-52 lg:w-64 h-9.5 sm:h-10 pl-3.5 pr-9 text-xs sm:text-sm text-[#1A1816] placeholder:text-stone-400 bg-white border border-[#1A1816] rounded-none focus:outline-none focus:ring-1 focus:ring-[#1A1816] transition shadow-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1A1816] hover:text-[#FF2D2D] transition cursor-pointer"
                >
                  <Search className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </form>

              {/* Mobile Search Toggle (for screens < sm) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 sm:hidden text-[#1A1816] hover:text-[#FF2D2D] transition"
                aria-label="Search merchandise"
                suppressHydrationWarning
              >
                <Search className="w-4.5 h-4.5" strokeWidth={1.75} />
              </button>

              {/* 1. Account (User Icon) */}
              <div className="relative flex items-center">
                {user ? (
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="p-1 text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center"
                    aria-label="Account menu"
                    suppressHydrationWarning
                  >
                    <UserIcon className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="p-1 text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center"
                    aria-label="Customer login"
                  >
                    <UserIcon className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                )}

                {/* Account dropdown menu */}
                {accountMenuOpen && user && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-[#FAF7F2] border border-[#E8E2D8] shadow-lg rounded-sm py-2 z-50 text-xs"
                    onMouseLeave={() => setAccountMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E8E2D8]">
                      <p className="font-semibold text-[#1A1816] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#7A7268] truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#FF2D2D] text-white text-[9px] rounded-xs uppercase tracking-wider font-semibold">
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-[#5C564E] hover:bg-[#F4EFEA] hover:text-[#1A1816]"
                    >
                      My Profile & Orders
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-[#FF2D2D] font-medium hover:bg-[#F4EFEA] flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-[#F4EFEA] flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Wishlist (Heart Icon) */}
              <Link
                href="/wishlist"
                className="p-1 text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" strokeWidth={1.75} />
              </Link>

              {/* 3. Official Storefront (Store Icon) */}
              <Link
                href="/shop"
                className="p-1 text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center"
                aria-label="Official Store Catalog"
                title="Browse Store"
              >
                <Store className="w-5 h-5" strokeWidth={1.75} />
              </Link>

              {/* 4. Shopping Bag Trigger with solid black circular count badge */}
              <button
                onClick={openCart}
                className="p-1 text-[#1A1816] hover:text-[#FF2D2D] transition relative flex items-center"
                aria-label={`Shopping bag with ${totalItemCount} items`}
                suppressHydrationWarning
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-[#1A1816] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4">
          <div className="bg-[#FAF7F2] border border-[#E8E2D8] w-full max-w-2xl rounded-sm p-4 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
              aria-label="Close search"
              suppressHydrationWarning
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif-editorial text-base sm:text-lg text-[#1A1816] mb-3 sm:mb-4">
              Search MST Store
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search hoodies, tees, tumblers, desk mats, caps..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8E2D8] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1A1816] placeholder-stone-400 focus:outline-none focus:border-[#FF2D2D] rounded-sm pr-11"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 sm:top-3 text-[#FF2D2D] p-1 hover:text-stone-900 transition"
                suppressHydrationWarning
              >
                <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
            </form>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap text-xs text-[#7A7268]">
              <span>Trending:</span>
              <button
                onClick={() => {
                  setSearchQuery('Hoodie');
                  router.push('/shop?q=Hoodie');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Hoodie
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('Tote Bag');
                  router.push('/shop?q=Tote');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Tote Bag
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('Bottle');
                  router.push('/shop?q=Bottle');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Bottle
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('Diary');
                  router.push('/shop?q=Diary');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Diary
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('Pins');
                  router.push('/shop?q=Pins');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Pins
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('Mystery Box');
                  router.push('/shop?q=Mystery');
                  setSearchOpen(false);
                }}
                className="hover:text-[#FF2D2D] underline"
              >
                Mystery Box
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF7F2] border-r border-[#E8E2D8] p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#E8E2D8]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 group"
                >
                  <Image
                    src="/logo.png"
                    alt="MST Brand Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-serif-editorial text-lg sm:text-xl font-medium tracking-tight text-[#1A1816] group-hover:text-[#FF2D2D] transition">
                    MST Brand
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 -mr-1.5 text-stone-500 hover:text-stone-900"
                  suppressHydrationWarning
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Search Box */}
              <form
                onSubmit={e => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }}
                className="mt-4 relative"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search merchandise..."
                  className="w-full bg-white border border-[#E8E2D8] px-3 py-2 text-xs text-[#1A1816] placeholder:text-stone-400 rounded-sm pr-9 focus:outline-none focus:border-[#FF2D2D]"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#FF2D2D]"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="py-5 space-y-3.5">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs uppercase tracking-widest font-medium text-[#1A1816] hover:text-[#FF2D2D] transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E2D8] space-y-3">
              {user ? (
                <>
                  <p className="text-xs text-[#7A7268]">Signed in as {user.name}</p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs uppercase tracking-widest font-medium text-[#1A1816] hover:text-[#FF2D2D]"
                  >
                    Account & Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs uppercase tracking-widest font-medium text-[#FF2D2D]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs uppercase tracking-widest font-medium text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium rounded-sm hover:bg-[#FF2D2D]"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
