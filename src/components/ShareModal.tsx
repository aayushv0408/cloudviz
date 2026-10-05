'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Clock,
  Download,
  QrCode,
  Lock,
  Terminal,
} from 'lucide-react';
import { MediaFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { useToast } from './Toast';

interface ShareModalProps {
  file: MediaFile | null;
  onClose: () => void;
}

export function ShareModal({ file, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const [expiresIn, setExpiresIn] = useState<string>('168');
  const [allowDownload, setAllowDownload] = useState<boolean>(true);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  if (!file) return null;

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          expiresInHours: expiresIn === '0' ? null : parseInt(expiresIn, 10),
          allowDownload,
          password: requirePassword ? password : null,
        }),
      });

      const data = await res.json();
      if (data.share) {
        const origin = window.location.origin;
        setShareUrl(`${origin}/share/${data.share.token}`);
        toast('Share access token created', 'success');
      }
    } catch {
      toast('Failed to create share link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast('Public share URL copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d1e] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col corner-bracket font-mono">
        {/* Terminal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">GENERATE::SHARE_TOKEN</h3>
              <p className="text-[10px] text-slate-500">// PUBLIC_STREAM_ACCESS_GATEWAY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Preview Pill */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-200 truncate">{file.name}</span>
          </div>
          <span className="text-[10px] text-cyan-400 ml-2 flex-shrink-0">
            {formatBytes(file.size)}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {!shareUrl ? (
            <>
              {/* Expiration Settings */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  TOKEN_EXPIRATION_POLICY
                </label>
                <select
                  value={expiresIn}
                  onChange={e => setExpiresIn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="1">1 Hour [TEMPORARY]</option>
                  <option value="24">24 Hours [STANDARD]</option>
                  <option value="168">7 Days [DEFAULT]</option>
                  <option value="720">30 Days [EXTENDED]</option>
                  <option value="0">Never [PERMANENT_LINK]</option>
                </select>
              </div>

              {/* Download Permission Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      ALLOW_BINARY_DOWNLOAD
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Recipients can retrieve the raw source file
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={e => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </div>

              {/* Password Protection */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">
                        ENCRYPTED_PASSWORD_GATE
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Require an access code before decrypting stream
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={requirePassword}
                    onChange={e => setRequirePassword(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                {requirePassword && (
                  <div className="relative pt-1">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Specify gate pass code..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                )}
              </div>

              <button
                disabled={loading || (requirePassword && !password)}
                onClick={handleGenerateShare}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all font-mono"
              >
                {loading ? 'CREATING_TOKEN...' : 'GENERATE_SHAREABLE_TOKEN'}
              </button>
            </>
          ) : (
            /* Share Link Ready View */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                [GATEWAY_OPEN] Link initialized! Anyone with this token can stream the file.
              </div>

              {/* Link Input with Copy Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{showQr ? 'HIDE_QR' : 'SHOW_MOBILE_QR'}</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OPEN_PUBLIC_GATEWAY</span>
                </a>
              </div>

              {/* QR Code Container */}
              {showQr && (
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center animate-in zoom-in-95 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      shareUrl
                    )}`}
                    alt="Share QR Code"
                    className="w-40 h-40"
                  />
                  <span className="text-[10px] text-slate-800 font-mono font-bold mt-2">
                    SCAN_TO_STREAM_MEDIA
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
