'use client';

import React, { useState } from 'react';
import { X, FolderInput, Folder as FolderIcon, Home } from 'lucide-react';
import { Folder, MediaFile } from '@/lib/types';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  filesToMove: MediaFile[];
  folders: Folder[];
  onMoveSuccess: (targetFolderId: string | null) => Promise<void>;
}

export function MoveModal({
  isOpen,
  onClose,
  filesToMove,
  folders,
  onMoveSuccess,
}: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || filesToMove.length === 0) return null;

  const handleMove = async () => {
    setLoading(true);
    try {
      await onMoveSuccess(selectedFolderId);
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
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">RELOCATE::MEDIA_OBJECTS</h3>
              <p className="text-[10px] text-slate-500">
                Targeting {filesToMove.length} item{filesToMove.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedFolderId === null
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>ROOT_DIRECTORY (Unassigned)</span>
            </button>

            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedFolderId === folder.id
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <FolderIcon className="w-4 h-4" style={{ color: folder.color || '#10B981' }} />
                <span>{folder.name}</span>
              </button>
            ))}
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
              onClick={handleMove}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? 'MOVING...' : 'RELOCATE_HERE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
