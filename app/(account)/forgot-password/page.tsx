'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function ForgotPasswordPage() {
  const { error } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        error('Failed to submit password reset request');
      }
    } catch {
      error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
            Account Security
          </span>
          <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
            Reset Password
          </h1>
          <p className="text-xs text-[#5C564E]">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-[#FAF7F2] border border-red-200 rounded-sm text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#FF2D2D] mx-auto" />
            <p className="text-xs text-[#1A1816] font-medium">
              If an account exists with <strong>{email}</strong>, a secure reset link has been dispatched to your inbox.
            </p>
            <Link
              href="/login"
              className="inline-block text-xs uppercase tracking-wider font-semibold text-[#FF2D2D] underline pt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{submitting ? 'Sending Request...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E8E2D8] text-center">
          <Link
            href="/login"
            className="text-xs text-[#7A7268] hover:text-[#1A1816] inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
