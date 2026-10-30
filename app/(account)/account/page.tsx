import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth/session';
import { getOrdersForUser } from '@/lib/services/order.service';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { Package, MapPin, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Address } from '@/types';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }

  const db = await getDb();
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.userId) },
    { projection: { passwordHash: 0, resetTokenHash: 0 } }    
  );

  const orders = await getOrdersForUser(session.userId);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E2D8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
              Customer Portal                    
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1816] mt-1">
              Hello, {session.name}
            </h1>
            <p className="text-xs text-[#7A7268] mt-1 font-sans">
              Member of MST Store • {session.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {session.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#FF2D2D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#E02424] transition flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/shop"
              className="px-4 py-2 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition"
            >
              Shop Catalog
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-[#E8E2D8] shadow-xs">
              <h2 className="font-serif-editorial text-xl text-[#1A1816] pb-4 border-b border-[#E8E2D8] flex items-center justify-between">
                <span>Your Order History</span>
                <span className="text-xs font-sans text-[#7A7268] font-normal">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-[#7A7268] mx-auto" />
                  <p className="text-sm font-medium text-[#1A1816]">No orders placed yet</p>
                  <p className="text-xs text-[#5C564E] max-w-sm mx-auto">
                    When you order official MST merchandise, you will be able to track live delivery updates and fulfillment timelines here.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/shop"
                      className="inline-block px-6 py-2 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D] transition"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E2D8]">
                  {orders.map(order => (
                    <div key={order._id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div>
                          <span className="font-mono font-bold text-[#1A1816] tracking-wider">
                            {order.orderNumber}
                          </span>
                          <span className="text-[#7A7268] ml-2 font-sans">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold tracking-wider bg-[#F4EFEA] text-[#1A1816] border border-[#E8E2D8]">
                            {order.paymentStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold tracking-wider bg-red-50 text-[#FF2D2D] border border-red-200">
                            {order.fulfillmentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-[#5C564E]">
                            <span className="truncate max-w-xs">{item.name} × {item.quantity}</span>
                            <span className="text-[#1A1816] font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8] text-xs">
                        <span className="text-[#5C564E]">
                          Total: <strong className="text-[#1A1816] font-bold">₹{order.total.toLocaleString('en-IN')}</strong>
                        </span>
                        <Link
                          href={`/order/${order.orderNumber}`}
                          className="text-[#FF2D2D] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>View Details & Tracking</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-[#E8E2D8] space-y-4 shadow-xs text-xs">
              <h3 className="font-serif-editorial text-base text-[#1A1816] flex items-center gap-2 pb-3 border-b border-[#E8E2D8]">
                <User className="w-4 h-4 text-[#FF2D2D]" />
                <span>Account Profile</span>
              </h3>
              <div className="space-y-1 text-[#5C564E]">
                <p className="font-semibold text-[#1A1816]">{session.name}</p>
                <p className="font-sans">{session.email}</p>
                <p className="text-[10px] uppercase font-sans tracking-widest text-[#FF2D2D] pt-1">
                  Role: {session.role}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-[#E8E2D8] space-y-4 shadow-xs text-xs">
              <h3 className="font-serif-editorial text-base text-[#1A1816] flex items-center gap-2 pb-3 border-b border-[#E8E2D8]">
                <MapPin className="w-4 h-4 text-[#FF2D2D]" />
                <span>Saved Addresses</span>
              </h3>
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr: Address, idx: number) => (
                    <div key={idx} className="p-3 bg-[#FAF7F2] rounded-sm border border-[#E8E2D8] text-[#5C564E] leading-relaxed">
                      <p className="font-semibold text-[#1A1816]">{addr.fullName}</p>
                      <p>{addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                      <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                      <p className="text-[11px] text-[#7A7268] mt-1 font-sans">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#7A7268]">
                  No addresses saved yet. Your primary address will be saved during checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
