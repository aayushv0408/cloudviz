'use client';

import React from 'react';
import {
  Folder as FolderIcon,
  Image,
  Video,
  Music,
  FileText,
  Star,
  Trash2,
  Plus,
  Cloud,
  Layers,
  X,
  Terminal,
  Shield,
} from 'lucide-react';
import { Folder, StorageStats } from '@/lib/types';
import { StorageMeter } from './StorageMeter';

interface SidebarProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  folders: Folder[];
  stats: StorageStats | null;
  storageProvider: string;
  onNewFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenStorageSettings: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  currentCategory,
  onSelectCategory,
  selectedFolderId,
  onSelectFolder,
  folders,
  stats,
  storageProvider,
  onNewFolder,
  onDeleteFolder,
  onOpenStorageSettings,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const mainNavItems = [
    { id: 'all', label: 'All Media Vault', icon: Layers, count: stats?.fileCount },
    { id: 'image', label: 'Photos & Graphics', icon: Image, count: stats?.byType.image.count },
    { id: 'video', label: 'Video Streams', icon: Video, count: stats?.byType.video.count },
    { id: 'audio', label: 'Audio & Waveforms', icon: Music, count: stats?.byType.audio.count },
    { id: 'document', label: 'Documents & Code', icon: FileText, count: stats?.byType.document.count },
    { id: 'favorites', label: 'Starred Archive', icon: Star },
    { id: 'trash', label: 'Trash Bin', icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#060a17] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Cloud className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  CloudStore
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                VAULT::SECURE
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main Media Categories */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>// REPOSITORIES</span>
              <Terminal className="w-3 h-3 text-slate-600" />
            </div>
            <nav className="space-y-1">
              {mainNavItems.map(item => {
                const Icon = item.icon;
                const isActive =
                  selectedFolderId === null && currentCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectFolder(null);
                      onSelectCategory(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Folders Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                // DIRECTORIES
              </span>
              <button
                onClick={onNewFolder}
                className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
                title="Create New Folder"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {folders.length === 0 ? (
                <div className="px-3 py-2 text-xs font-mono text-slate-600 italic">
                  [EMPTY_ROOT] No custom folders
                </div>
              ) : (
                folders.map(folder => {
                  const isActive = selectedFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectFolder(folder.id);
                          onCloseMobile();
                        }}
                        className="flex items-center gap-3 flex-1 text-left truncate"
                      >
                        <FolderIcon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: folder.color || '#10B981' }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Delete folder "${folder.name}"? Files will be moved to root.`)) {
                            onDeleteFolder(folder.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </nav>
          </div>
        </div>

        {/* Bottom Storage Quota Meter */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <StorageMeter
            stats={stats}
            onOpenSettings={onOpenStorageSettings}
            storageProvider={storageProvider}
          />
        </div>
      </aside>
    </>
  );
}
