'use client';

import React from 'react';
import { StorageStats } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { HardDrive, Cpu, Terminal } from 'lucide-react';

interface StorageMeterProps {
  stats: StorageStats | null;
  onOpenSettings: () => void;
  storageProvider?: string;
}

export function StorageMeter({ stats, onOpenSettings, storageProvider = 'local' }: StorageMeterProps) {
  if (!stats) return null;

  const used = stats.usedBytes;
  const total = stats.totalBytes;
  const percentUsed = Math.min(100, Math.max(0.5, (used / total) * 100));

  const imgPercent = (stats.byType.image.bytes / total) * 100;
  const vidPercent = (stats.byType.video.bytes / total) * 100;
  const audPercent = (stats.byType.audio.bytes / total) * 100;
  const docPercent = (stats.byType.document.bytes / total) * 100;

  return (
    <div className="p-4 rounded-2xl bg-[#090f20]/70 border border-emerald-500/20 backdrop-blur-xl shadow-lg relative overflow-hidden group">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-60" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            STORAGE::TELEMETRY
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          [MANAGE]
        </button>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline justify-between font-mono">
          <span className="text-base font-bold text-white tracking-tight">{formatBytes(used)}</span>
          <span className="text-[11px] text-slate-400">/ {formatBytes(total)}</span>
        </div>
      </div>

      {/* Segmented Neon Progress Bar */}
      <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
        <div
          style={{ width: `${Math.max(1, imgPercent)}%` }}
          className="h-full bg-purple-500 rounded-l-full shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500"
          title={`Images: ${formatBytes(stats.byType.image.bytes)}`}
        />
        <div
          style={{ width: `${Math.max(0, vidPercent)}%` }}
          className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500"
          title={`Videos: ${formatBytes(stats.byType.video.bytes)}`}
        />
        <div
          style={{ width: `${Math.max(0, audPercent)}%` }}
          className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-500"
          title={`Audio: ${formatBytes(stats.byType.audio.bytes)}`}
        />
        <div
          style={{ width: `${Math.max(0, docPercent)}%` }}
          className="h-full bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
          title={`Documents: ${formatBytes(stats.byType.document.bytes)}`}
        />
      </div>

      {/* Categories Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_#a855f7]" />
          <span>IMG: {formatBytes(stats.byType.image.bytes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]" />
          <span>VID: {formatBytes(stats.byType.video.bytes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
          <span>AUD: {formatBytes(stats.byType.audio.bytes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
          <span>DOC: {formatBytes(stats.byType.document.bytes)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-slate-500 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
        <span>MOUNT_POINT</span>
        <span className="font-semibold text-emerald-400 uppercase tracking-wider">
          {storageProvider}::ONLINE
        </span>
      </div>
    </div>
  );
}
