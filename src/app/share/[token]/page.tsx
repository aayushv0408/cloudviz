'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Download,
  Cloud,
  Lock,
  Calendar,
  Eye,
  FileText,
  Music,
  Video,
  AlertCircle,
  ExternalLink,
  Shield,
  Terminal,
} from 'lucide-react';
import { MediaFile, ShareLink } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/utils';

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<MediaFile | null>(null);
  const [share, setShare] = useState<ShareLink | null>(null);

  // Password state
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [pwdError, setPwdError] = useState('');

  const loadSharedFile = async (pwd?: string) => {
    setLoading(true);
    setPwdError('');
    try {
      const url = `/api/share/${token}${pwd ? `?pwd=${encodeURIComponent(pwd)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.status === 401 && data.requirePassword) {
        setRequirePassword(true);
        if (pwd) setPwdError('Decryption passkey incorrect.');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Failed to locate shared media stream.');
        return;
      }

      setFile(data.file);
      setShare(data.share);
      setRequirePassword(false);
    } catch {
      setError('An error occurred while connecting to this stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSharedFile();
    }
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    loadSharedFile(password);
  };

  const handleDownload = () => {
    if (!file || !share?.allowDownload) return;
    fetch(`/api/share/${token}?download=true`).catch(console.error);

    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !requirePassword) {
    return (
      <div className="min-h-screen bg-[#040711] flex items-center justify-center p-6 text-slate-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-pulse">
            <Cloud className="w-6 h-6" />
          </div>
          <p className="text-xs">// CONNECTING_TO_STREAM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#040711] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#080d1e] border border-rose-500/30 text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.15)] corner-bracket">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-sm font-bold text-white uppercase">[GATEWAY_DENIED] Media Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (requirePassword) {
    return (
      <div className="min-h-screen bg-[#040711] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#080d1e] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center space-y-6 corner-bracket">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wider">ENCRYPTED_GATEWAY</h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide authorization passkey to stream this asset
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter gate passkey..."
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
            {pwdError && <p className="text-xs text-rose-400">{pwdError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
            >
              DECRYPT_AND_STREAM
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-[#060a17]/80 backdrop-blur-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Cloud className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-xs tracking-wider text-white">CLOUDSTORE // GATEWAY</span>
            <span className="text-[10px] text-cyan-400 block -mt-0.5">// PUBLIC_STREAM</span>
          </div>
        </div>

        {share?.allowDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>RETRIEVE_FILE ({formatBytes(file.size)})</span>
          </button>
        )}
      </header>

      {/* Main Content Viewer */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
        <div className="w-full rounded-3xl bg-[#080d1e]/80 border border-cyan-500/30 p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center corner-bracket">
          {/* MEDIA VIEWER */}
          <div className="w-full flex items-center justify-center mb-6 overflow-hidden rounded-2xl bg-black/60 border border-slate-800">
            {file.mediaType === 'image' && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
              />
            )}

            {file.mediaType === 'video' && (
              <video
                src={file.url}
                controls
                playsInline
                className="max-h-[65vh] w-full rounded-xl"
              />
            )}

            {file.mediaType === 'audio' && (
              <div className="w-full py-12 px-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <Music className="w-10 h-10 stroke-[2.5]" />
                </div>
                <audio src={file.url} controls className="w-full max-w-lg mb-4" />
              </div>
            )}

            {file.mediaType === 'document' && (
              <div className="w-full h-[65vh]">
                {file.mimeType === 'application/pdf' ? (
                  <iframe src={file.url} className="w-full h-full border-none rounded-xl" title={file.name} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center font-mono">
                    <FileText className="w-16 h-16 text-amber-400 mb-4" />
                    <p className="text-sm text-slate-300 mb-4">Document preview</p>
                    {share?.allowDownload && (
                      <button
                        onClick={handleDownload}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        DOWNLOAD_FILE
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {file.mediaType === 'other' && (
              <div className="py-16 px-8 text-center font-mono">
                <p className="text-sm text-slate-300 mb-4">Binary file format</p>
                {share?.allowDownload && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    DOWNLOAD_FILE
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Media Info Footer */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div>
              <h1 className="text-base font-bold text-white font-sans">{file.name}</h1>
              <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{file.originalName}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-cyan-300">
                {formatBytes(file.size)}
              </span>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>{share?.viewsCount || 1} STREAM_HITS</span>
              </div>
              {share?.expiresAt && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Calendar className="w-4 h-4" />
                  <span>EXPIRES {formatDate(share.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900">
        CLOUDSTORE // SECURE_MEDIA_INFRASTRUCTURE
      </footer>
    </div>
  );
}
