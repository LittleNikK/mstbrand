'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      success('Welcome back to MST Store.');
      router.push('/account');
    } else {
      error(res.error || 'Failed to sign in');
    }
  };

  const handleAutofillDemo = (demoType: 'admin' | 'customer') => {
    if (demoType === 'admin') {
      setEmail('admin@mststore.com');
      setPassword('Admin@123456');
    } else {
      setEmail('customer@mststore.com');
      setPassword('Customer@123456');
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
            MST Store Account
          </span>
          <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#5C564E]">
            Sign in to access your order history, delivery addresses, and wishlist.
          </p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="p-3 bg-[#F4EFEA] border border-[#E8E2D8] rounded-sm text-xs space-y-2">
          <div className="flex items-center justify-between text-[#1A1816] text-[11px] font-semibold uppercase tracking-wider">
            <span>Instant Demo Logins</span>
            <span className="text-[10px] font-normal text-[#7A7268] lowercase">click to autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAutofillDemo('admin')}
              className="py-2 px-2.5 bg-white border border-[#D5CCC0] text-[11px] font-medium text-[#1A1816] hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition rounded-xs text-left"
            >
              <span className="font-semibold block">Store Admin</span>
              <span className="text-[10px] text-[#7A7268] block font-mono">Admin@123456</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutofillDemo('customer')}
              className="py-2 px-2.5 bg-white border border-[#D5CCC0] text-[11px] font-medium text-[#1A1816] hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition rounded-xs text-left"
            >
              <span className="font-semibold block">Test Customer</span>
              <span className="text-[10px] text-[#7A7268] block font-mono">Customer@123456</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#7A7268] hover:text-[#FF2D2D]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E8E2D8] text-center text-xs text-[#5C564E]">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/register" className="font-semibold text-[#1A1816] hover:text-[#FF2D2D] underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
