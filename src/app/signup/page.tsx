'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cloud, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle, Loader2, Terminal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('All parameters are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmations do not match.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error || 'Account initialization failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-black relative overflow-hidden font-mono">
      {/* Background Matrix & Radial Glows */}
      <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/20 mx-auto mb-4 border border-cyan-400/30">
            <Cloud className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white">INITIALIZE::NEW_VAULT</h1>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            [SYS.REGISTER] Provision isolated personal media repository
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#080d1e]/80 border border-emerald-500/30 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] corner-bracket">
          {/* Storage Quota Allocation Pill */}
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>[ALLOCATED] 50 GB Free Isolated Cloud Quota</span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                AGENT_ALIAS (NAME)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                COMMUNICATION_ADDRESS (EMAIL)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="maya@vault.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                MASTER_PASSKEY
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                CONFIRM_PASSKEY
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter passkey"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>PROVISIONING_VAULT...</span>
                </>
              ) : (
                <>
                  <span>PROVISION_NEW_VAULT</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          Already hold active credentials?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">
            AUTHENTICATE_SESSION
          </Link>
        </p>
      </div>
    </div>
  );
}
