'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Upload,
  LayoutGrid,
  List,
  Menu,
  Settings,
  HardDrive,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Command,
  Radio,
  Cpu,
} from 'lucide-react';
import { SafeUser } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenUpload: () => void;
  onOpenStorageSettings: () => void;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  storageProvider: string;
  user: SafeUser | null;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenUpload,
  onOpenStorageSettings,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  storageProvider,
  user,
}: NavbarProps) {
  const isCloud = storageProvider !== 'local';
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-[#060a17]/80 backdrop-blur-2xl flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Spotlight Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar with Ctrl+K trigger */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex-1 group cursor-pointer"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80 group-hover:text-cyan-300 transition-colors pointer-events-none" />
          <input
            type="text"
            readOnly
            value={searchQuery}
            placeholder="Search vault or press Ctrl+K..."
            className="w-full pl-10 pr-16 py-2 bg-slate-900/60 border border-slate-800/80 group-hover:border-cyan-500/40 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none transition-all cursor-pointer"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* System Telemetry Pill (Hacker style) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>VAULT::ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-cyan-400">AES-256</span>
        </div>

        {/* Storage Provider Pill */}
        <button
          onClick={onOpenStorageSettings}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isCloud
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title="Storage Provider Config"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCloud ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className="uppercase tracking-wider font-semibold text-[11px]">
            {isCloud ? `${storageProvider} Cloud` : 'Local Storage'}
          </span>
          <Settings className="w-3.5 h-3.5 opacity-60" />
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Media Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline uppercase tracking-wide">Upload</span>
        </button>

        {/* User Profile Avatar Capsule */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-bold text-white text-[11px] font-mono shadow-sm">
              {initials}
            </div>
            <span className="font-medium text-slate-200 hidden md:inline max-w-[100px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#090e1c] border border-cyan-500/30 shadow-2xl py-2 z-40 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 corner-bracket">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
                  <Shield className="w-3 h-3" />
                  <span>VAULT_ENCRYPTED</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenStorageSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 text-left font-mono"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Storage Engine Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 text-left font-mono"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
