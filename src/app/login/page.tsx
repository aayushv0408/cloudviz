'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cloud, Lock, Mail, ArrowRight, Sparkles, AlertCircle, Loader2, Terminal, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both identity and passkey.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Authentication rejected');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@cloudstore.io');
    setPassword('password123');
    setError('');
    setLoading(true);

    const result = await login('demo@cloudstore.io', 'password123');
    if (!result.success) {
      setError(result.error || 'Demo access failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-black relative overflow-hidden font-mono">
      {/* Background Matrix & Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/20 mx-auto mb-4 border border-cyan-400/30">
            <Cloud className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white">CLOUDSTORE // ACCESS_GATEWAY</h1>
          <p className="text-[11px] text-cyan-400/80 mt-1 font-mono">
            [SYS.AUTH] Secure session validation &amp; vault decryption
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#080d1e]/80 border border-cyan-500/30 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] corner-bracket">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                USER_IDENTITY (EMAIL)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="agent@cloudstore.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  ACCESS_PASSKEY
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>VERIFYING_PASSKEY...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE_VAULT</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Option */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPLORE_DEMO_VAULT (Alex Morgan)</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          Need an isolated personal vault?{' '}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4">
            INITIALIZE_ACCOUNT
          </Link>
        </p>
      </div>
    </div>
  );
}
