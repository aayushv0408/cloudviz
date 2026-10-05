'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Upload,
  FolderPlus,
  Settings,
  X,
  Terminal,
  CornerDownLeft,
} from 'lucide-react';
import { MediaFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: MediaFile[];
  onSelectFile: (file: MediaFile) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onOpenStorageSettings: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onOpenUpload,
  onOpenNewFolder,
  onOpenStorageSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.originalName.toLowerCase().includes(query.toLowerCase()) ||
    f.mediaType.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 7);

  const quickActions = [
    { id: 'upload', label: 'Upload Media Files', icon: Upload, action: onOpenUpload },
    { id: 'folder', label: 'Create New Folder', icon: FolderPlus, action: onOpenNewFolder },
    { id: 'settings', label: 'Configure Cloud Storage (S3/R2)', icon: Settings, action: onOpenStorageSettings },
  ];

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    const totalItems = filteredFiles.length + (query ? 0 : quickActions.length);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredFiles.length) {
        onSelectFile(filteredFiles[selectedIndex]);
        onClose();
      } else {
        const actionIdx = selectedIndex - filteredFiles.length;
        if (quickActions[actionIdx]) {
          quickActions[actionIdx].action();
          onClose();
        }
      }
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#090e1c] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col corner-bracket">
        {/* Terminal Header */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider">COMMAND::SPOTLIGHT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500">ESC to dismiss</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800/80 bg-slate-900/40">
          <Search className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder="Type a file name, extension (.mp4, .png), or command..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredFiles.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Media Files ({filteredFiles.length})
              </div>
              {filteredFiles.map((file, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      onSelectFile(file);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200'
                        : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        {getMediaIcon(file.mediaType)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium block truncate text-slate-200">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block truncate">
                          {file.originalName} • {formatBytes(file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {file.mediaType}
                      </span>
                      {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              [NO_MATCH_FOUND] No files matching &quot;{query}&quot;
            </div>
          ) : null}

          {/* Quick Actions (when query is empty) */}
          {!query && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Quick Actions
              </div>
              {quickActions.map((action, idx) => {
                const actualIdx = filteredFiles.length + idx;
                const isSelected = selectedIndex === actualIdx;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                        : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-200">{action.label}</span>
                    </div>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>CloudStore v2.0 Terminal</span>
        </div>
      </div>
    </div>
  );
}
