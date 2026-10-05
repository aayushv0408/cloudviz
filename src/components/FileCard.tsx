'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  File as GenericFile,
  Star,
  MoreVertical,
  Share2,
  Download,
  Trash2,
  FolderInput,
  Edit2,
  Play,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { MediaFile, Folder } from '@/lib/types';
import { formatBytes, formatDate, formatDuration } from '@/lib/utils';

interface FileCardProps {
  file: MediaFile;
  isSelected: boolean;
  onToggleSelect: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
  onToggleFavorite: (file: MediaFile) => void;
  onShare: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  onRename: (file: MediaFile) => void;
  onMove: (file: MediaFile) => void;
  folders: Folder[];
}

export function FileCard({
  file,
  isSelected,
  onToggleSelect,
  onPreview,
  onToggleFavorite,
  onShare,
  onDelete,
  onRename,
  onMove,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const ext = file.originalName.split('.').pop()?.toUpperCase() || 'FILE';

  const renderThumbnail = () => {
    switch (file.mediaType) {
      case 'image':
        return (
          <div className="relative w-full h-44 bg-[#030611] overflow-hidden group-hover:opacity-95 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090e1c] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            {file.metadata?.width && file.metadata?.height && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
                {file.metadata.width}×{file.metadata.height}
              </span>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-44 bg-[#030611] flex items-center justify-center overflow-hidden">
            <video
              src={file.url}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/80 text-black flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
            </div>
            {file.metadata?.duration && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                {formatDuration(file.metadata.duration)}
              </span>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-44 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-[#030611] flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform">
              <Music className="w-7 h-7" />
            </div>
            {/* Animated frequency visualizer bars */}
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 30, 90, 50, 100, 60, 30, 80, 50, 20].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1 bg-emerald-500/50 rounded-full group-hover:bg-emerald-400 transition-colors"
                />
              ))}
            </div>
            {file.metadata?.duration && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/20">
                {formatDuration(file.metadata.duration)}
              </span>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="relative w-full h-44 bg-gradient-to-br from-amber-950/20 via-slate-950 to-[#030611] flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">
              .{ext}
            </span>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-44 bg-[#030611] flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-2 group-hover:scale-110 transition-transform">
              <GenericFile className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">
              .{ext}
            </span>
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border cyber-card ${
        isSelected
          ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : 'bg-[#090e1c]/80 border-slate-800/80 hover:border-cyan-500/40'
      }`}
    >
      {/* Top Header Overlay (Checkbox & Actions) */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-auto">
        {/* Selection Checkbox */}
        <div
          onClick={e => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              : 'border-white/30 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:border-white'
          }`}
        >
          {isSelected && (
            <svg className="w-3.5 h-3.5 fill-current stroke-current" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          )}
        </div>

        {/* Right buttons: Favorite & Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(file);
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              file.isFavorite
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-black/60 text-slate-300 border border-white/20 opacity-0 group-hover:opacity-100 hover:text-white'
            }`}
            title={file.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Action Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-[#090e1c] border border-cyan-500/30 shadow-2xl py-1.5 z-30 font-mono text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onPreview(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview & Info</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShare(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-indigo-300 hover:bg-slate-800/60 text-left"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Share Token</span>
                </button>
                <a
                  href={file.url}
                  download={file.originalName}
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onMove(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 text-left"
                >
                  <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                  <span>Move to Folder</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRename(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{file.isTrash ? 'Purge Permanently' : 'Move to Trash'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Thumbnail Media Area */}
      {renderThumbnail()}

      {/* Card Info Footer */}
      <div className="p-3.5 bg-[#070b16]/90 border-t border-slate-800/80">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300 transition-colors"
            title={file.name}
          >
            {file.name}
          </h4>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
            {ext}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
