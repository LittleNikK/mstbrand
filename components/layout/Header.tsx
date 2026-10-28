'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    { name: 'Bags & Totes', href: '/shop?category=bags' },
    { name: 'Drinkware', href: '/shop?category=drinkware' },
    { name: 'Stationery', href: '/shop?category=stationery' },
    { name: 'Pins & Badges', href: '/shop?category=goodies' },
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
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-[#E8E2D8] py-2 shadow-xs'
            : 'bg-[#FAF7F2] border-[#E8E2D8] py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-[#1A1816] hover:text-[#FF2D2D] transition"
                aria-label="Open navigation menu"
                suppressHydrationWarning
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Wordmark */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-flex items-center group">
                <span className="font-serif-editorial text-xl sm:text-2xl font-medium tracking-tight text-[#1A1816] group-hover:text-[#FF2D2D] transition">
                  MST STORE
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

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#1A1816] hover:text-[#FF2D2D] transition"
                aria-label="Search merchandise"
                suppressHydrationWarning
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-[#1A1816] hover:text-[#FF2D2D] transition"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="p-2 text-[#1A1816] hover:text-[#FF2D2D] transition flex items-center gap-1"
                    aria-label="Account menu"
                    suppressHydrationWarning
                  >
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden md:inline text-xs font-medium max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 text-[#1A1816] hover:text-[#FF2D2D] transition"
                    aria-label="Customer login"
                  >
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}

                {/* Account dropdown menu */}
                {accountMenuOpen && user && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#FAF7F2] border border-[#E8E2D8] shadow-lg rounded-sm py-2 z-50 text-xs"
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

              {/* Shopping Bag Trigger */}
              <button
                onClick={openCart}
                className="p-2 text-[#1A1816] hover:text-[#FF2D2D] transition relative"
                aria-label={`Shopping bag with ${totalItemCount} items`}
                suppressHydrationWarning
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF2D2D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-[#FAF7F2] border border-[#E8E2D8] w-full max-w-2xl rounded-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
              aria-label="Close search"
              suppressHydrationWarning
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif-editorial text-lg text-[#1A1816] mb-4">
              Search MST Store
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search hoodies, tees, tumblers, desk mats, caps..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8E2D8] px-4 py-3 text-sm text-[#1A1816] placeholder-stone-400 focus:outline-none focus:border-[#FF2D2D] rounded-sm pr-12"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-[#FF2D2D] p-1 hover:text-stone-900 transition"
                suppressHydrationWarning
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-[#7A7268]">
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
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-[#FAF7F2] border-r border-[#E8E2D8] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D8]">
                <span className="font-serif-editorial text-xl font-medium tracking-tight text-[#1A1816]">
                  MST STORE
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-stone-500 hover:text-stone-900"
                  suppressHydrationWarning
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm uppercase tracking-widest font-medium text-[#1A1816] hover:text-[#FF2D2D] transition"
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
