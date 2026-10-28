'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      success('Account created! Welcome to MST Store.');
      router.push('/account');
    } else {
      error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
            MST Store Membership
          </span>
          <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
            Create An Account
          </h1>
          <p className="text-xs text-[#5C564E]">
            Join the global ecosystem of MST Blockchain builders and contributors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alisha Roy"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="alisha@example.com"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Mobile Number (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98200 12345"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Password (Min 8 Characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E8E2D8] text-center text-xs text-[#5C564E]">
          <span>Already have an account? </span>
          <Link href="/login" className="font-semibold text-[#1A1816] hover:text-[#FF2D2D] underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
