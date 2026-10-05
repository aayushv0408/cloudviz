'use client';

import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { MediaFile } from '@/lib/types';

interface RenameModalProps {
  file: MediaFile | null;
  onClose: () => void;
  onRenameSuccess: (fileId: string, newName: string) => Promise<void>;
}

export function RenameModal({ file, onClose, onRenameSuccess }: RenameModalProps) {
  const [name, setName] = useState(file?.name || '');
  const [loading, setLoading] = useState(false);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onRenameSuccess(file.id, name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#080d1e] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] corner-bracket font-mono">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">UPDATE::IDENTIFIER</h3>
              <p className="text-[10px] text-slate-500">// MUTATE_METADATA_LABEL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              TARGET_LABEL
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
              ORIGINAL_SPEC: <span className="text-cyan-400">{file.originalName}</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? 'MUTATING...' : 'UPDATE_LABEL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
