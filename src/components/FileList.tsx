'use client';

import React from 'react';
import {
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  File as GenericFile,
  Star,
  Download,
  Share2,
  Trash2,
  FolderInput,
} from 'lucide-react';
import { MediaFile, Folder } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/utils';

interface FileListProps {
  files: MediaFile[];
  selectedFileIds: string[];
  onToggleSelect: (fileId: string) => void;
  onSelectAll: () => void;
  onPreview: (file: MediaFile) => void;
  onToggleFavorite: (file: MediaFile) => void;
  onShare: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  onMove: (file: MediaFile) => void;
  folders: Folder[];
}

export function FileList({
  files,
  selectedFileIds,
  onToggleSelect,
  onSelectAll,
  onPreview,
  onToggleFavorite,
  onShare,
  onDelete,
  onMove,
  folders,
}: FileListProps) {
  const allSelected = files.length > 0 && selectedFileIds.length === files.length;

  const getFileIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <GenericFile className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#070b16]/70 backdrop-blur-2xl shadow-xl">
      <table className="w-full text-left font-mono text-xs text-slate-300">
        <thead className="bg-[#050811]/90 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
          <tr>
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
              />
            </th>
            <th className="py-3 px-3">MEDIA_IDENTIFIER</th>
            <th className="py-3 px-3 hidden md:table-cell">DIRECTORY</th>
            <th className="py-3 px-3 hidden sm:table-cell">TYPE</th>
            <th className="py-3 px-3">ALLOCATED_SIZE</th>
            <th className="py-3 px-3 hidden lg:table-cell">TIMESTAMP</th>
            <th className="p-4 text-right">OPERATIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-sans">
          {files.map(file => {
            const isSelected = selectedFileIds.includes(file.id);
            const folder = folders.find(f => f.id === file.folderId);
            const ext = file.originalName.split('.').pop()?.toUpperCase() || 'FILE';

            return (
              <tr
                key={file.id}
                onClick={() => onPreview(file)}
                className={`group cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-950/20' : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Selection Checkbox */}
                <td
                  className="p-4"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleSelect(file.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(file.id)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                  />
                </td>

                {/* File Icon & Name */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60">
                      {getFileIcon(file.mediaType)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-slate-200 group-hover:text-cyan-400 truncate block max-w-xs md:max-w-md text-xs">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 truncate block">
                        {file.originalName}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Folder Badge */}
                <td className="py-3 px-3 hidden md:table-cell font-mono">
                  {folder ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border"
                      style={{
                        backgroundColor: `${folder.color || '#3B82F6'}15`,
                        color: folder.color || '#3B82F6',
                        borderColor: `${folder.color || '#3B82F6'}30`,
                      }}
                    >
                      {folder.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">ROOT::DIR</span>
                  )}
                </td>

                {/* Media Type Chip */}
                <td className="py-3 px-3 hidden sm:table-cell font-mono">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-cyan-500/20">
                    .{ext}
                  </span>
                </td>

                {/* File Size */}
                <td className="py-3 px-3 text-xs text-slate-400 font-mono">
                  {formatBytes(file.size)}
                </td>

                {/* Date */}
                <td className="py-3 px-3 hidden lg:table-cell text-xs font-mono text-slate-500">
                  {formatDate(file.createdAt)}
                </td>

                {/* Action Buttons */}
                <td
                  className="p-4 text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggleFavorite(file)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        file.isFavorite
                          ? 'text-amber-400 bg-amber-400/10 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={file.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onShare(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={file.url}
                      download={file.originalName}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onMove(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Move"
                    >
                      <FolderInput className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
