import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin' && session.role !== 'staff') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121212] p-8 rounded-sm border border-white/10 text-center space-y-4 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-[#FF2D2D] mx-auto" />
          <h1 className="font-heading text-2xl font-bold text-white">Access Restricted</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            Your current account ({session.email}) does not have administrative store privileges.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-[#FF2D2D] text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#E02626] transition shadow-md"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Merch & Products', href: '/admin/products', icon: Shirt },
    { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
    { name: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Discount Codes', href: '/admin/discounts', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#121212] text-white shrink-0 flex flex-col justify-between border-r border-white/10">
        <div>
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="block">
              <span className="font-heading text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span className="text-[#FF2D2D]">MST</span> STORE
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#FF2D2D] font-bold mt-0.5">
                Operations & Merch Portal
              </span>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <Icon className="w-4 h-4 text-[#FF2D2D]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-1 text-xs text-white/50 truncate">
            <p className="font-semibold text-white truncate">{session.name}</p>
            <p className="text-[10px] text-[#FF2D2D] uppercase tracking-widest font-bold">{session.role}</p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition uppercase tracking-wider font-semibold"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
