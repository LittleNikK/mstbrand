'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { success, error } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      error('Invalid password reset link. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleted(true);
        success('Password updated successfully');
      } else {
        error(data.error || 'Failed to reset password');
      }
    } catch {
      error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-[#E8E2D8] shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
          Account Security
        </span>
        <h1 className="font-serif-editorial text-3xl text-[#1A1816]">
          Set New Password
        </h1>
        <p className="text-xs text-[#5C564E]">
          Choose a secure password of at least 8 characters.
        </p>
      </div>

      {completed ? (
        <div className="p-4 bg-[#FAF7F2] border border-red-200 rounded-sm text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-[#FF2D2D] mx-auto" />
          <p className="text-xs text-[#1A1816] font-medium">
            Your password has been securely updated. You can now log into your account.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#FF2D2D]"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              New Password (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] px-3.5 py-2.5 text-xs text-[#1A1816] rounded-sm focus:outline-none focus:border-[#FF2D2D]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold tracking-widest uppercase hover:bg-[#FF2D2D] transition rounded-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{submitting ? 'Updating...' : 'Update Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-[75vh] flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-xs uppercase tracking-wider">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
