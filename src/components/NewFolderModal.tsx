'use client';

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => Promise<void>;
}

const COLORS = [
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
];

export function NewFolderModal({ isOpen, onClose, onCreateFolder }: NewFolderModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreateFolder(name.trim(), selectedColor);
      setName('');
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">PROVISION::NEW_DIRECTORY</h3>
              <p className="text-[10px] text-slate-500">// ORGANIZE_MEDIA_VAULT</p>
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
              DIRECTORY_NAME
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. PROJECT_OMEGA, RAW_ASSETS"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 placeholder-slate-600 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              COLOR_TAG_IDENTIFIER
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === color
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
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
              {loading ? 'PROVISIONING...' : 'CREATE_DIR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
