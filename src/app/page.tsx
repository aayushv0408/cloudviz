'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FolderPlus,
  ArrowUpDown,
  Trash2,
  Share2,
  FolderInput,
  RefreshCw,
  Folder as FolderIcon,
  ChevronRight,
  HardDrive,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  Activity,
  FileCheck,
} from 'lucide-react';
import { MediaFile, Folder, StorageStats } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { FileGrid } from '@/components/FileGrid';
import { FileList } from '@/components/FileList';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { UploadModal } from '@/components/UploadModal';
import { ShareModal } from '@/components/ShareModal';
import { NewFolderModal } from '@/components/NewFolderModal';
import { MoveModal } from '@/components/MoveModal';
import { RenameModal } from '@/components/RenameModal';
import { StorageSettingsModal } from '@/components/StorageSettingsModal';
import { CommandPalette } from '@/components/CommandPalette';
import { formatBytes } from '@/lib/utils';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [storageProvider, setStorageProvider] = useState<string>('local');
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Navigation
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-selection
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isStorageSettingsOpen, setIsStorageSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [shareFile, setShareFile] = useState<MediaFile | null>(null);
  const [fileToRename, setFileToRename] = useState<MediaFile | null>(null);
  const [filesToMove, setFilesToMove] = useState<MediaFile[]>([]);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  // Mobile drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirect to /login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all initial data
  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const isTrash = currentCategory === 'trash';
      const isFav = currentCategory === 'favorites';
      const typeParam =
        ['image', 'video', 'audio', 'document'].includes(currentCategory)
          ? currentCategory
          : undefined;

      const folderParam =
        currentCategory === 'all'
          ? selectedFolderId
            ? selectedFolderId
            : 'root'
          : undefined;

      const queryParams = new URLSearchParams();
      if (isTrash) queryParams.set('trash', 'true');
      if (isFav) queryParams.set('favorite', 'true');
      if (typeParam) queryParams.set('type', typeParam);
      if (folderParam) queryParams.set('folderId', folderParam);
      if (searchQuery) queryParams.set('search', searchQuery);

      const [filesRes, foldersRes, storageRes] = await Promise.all([
        fetch(`/api/files?${queryParams.toString()}`),
        fetch('/api/folders'),
        fetch('/api/storage/settings'),
      ]);

      const filesData = await filesRes.json();
      const foldersData = await foldersRes.json();
      const storageData = await storageRes.json();

      if (filesData.files) setFiles(filesData.files);
      if (filesData.stats) setStats(filesData.stats);
      if (foldersData.folders) setFolders(foldersData.folders);
      if (storageData.config?.provider) setStorageProvider(storageData.config.provider);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, currentCategory, selectedFolderId, searchQuery]);

  // Sort files
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [files, sortBy, sortOrder]);

  // File action handlers
  const handleToggleFavorite = async (file: MediaFile) => {
    try {
      const nextFav = !file.isFavorite;
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, isFavorite: nextFav } : f))
      );

      await fetch(`/api/files/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });

      toast(nextFav ? `Favorited "${file.name}"` : `Removed from favorites`, 'success');
    } catch (err) {
      toast('Failed to update favorite', 'error');
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    const isPermanent = file.isTrash;
    const confirmMsg = isPermanent
      ? `Permanently delete "${file.name}"? This cannot be undone.`
      : `Move "${file.name}" to trash?`;

    if (!confirm(confirmMsg)) return;

    try {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setSelectedFileIds(prev => prev.filter(id => id !== file.id));

      await fetch(`/api/files/${file.id}?permanent=${isPermanent}`, {
        method: 'DELETE',
      });
      fetchData();
      toast(isPermanent ? 'File permanently purged' : 'File moved to trash', 'info');
    } catch (err) {
      toast('Failed to delete file', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Permanently delete all files in the trash?')) return;
    try {
      for (const file of files) {
        if (file.isTrash) {
          await fetch(`/api/files/${file.id}?permanent=true`, { method: 'DELETE' });
        }
      }
      fetchData();
      toast('Trash bin emptied', 'success');
    } catch (err) {
      toast('Error emptying trash', 'error');
    }
  };

  const handleRenameSuccess = async (fileId: string, newName: string) => {
    try {
      await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      fetchData();
      toast(`File renamed to "${newName}"`, 'success');
    } catch (err) {
      toast('Failed to rename file', 'error');
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      fetchData();
      toast(`Created directory "${name}"`, 'success');
    } catch (err) {
      toast('Failed to create folder', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await fetch(`/api/folders?id=${folderId}`, { method: 'DELETE' });
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      fetchData();
      toast('Directory removed', 'info');
    } catch (err) {
      toast('Failed to delete folder', 'error');
    }
  };

  const handleMoveSuccess = async (targetFolderId: string | null) => {
    try {
      await Promise.all(
        filesToMove.map(f =>
          fetch(`/api/files/${f.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId: targetFolderId || 'root' }),
          })
        )
      );
      setSelectedFileIds([]);
      fetchData();
      toast(`Moved ${filesToMove.length} item(s)`, 'success');
    } catch (err) {
      toast('Failed to move files', 'error');
    }
  };

  // Multi-select handlers
  const handleToggleSelect = (fileId: string) => {
    setSelectedFileIds(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === sortedFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(sortedFiles.map(f => f.id));
    }
  };

  const handleBatchDelete = async () => {
    const isTrash = currentCategory === 'trash';
    const confirmMsg = isTrash
      ? `Permanently delete ${selectedFileIds.length} items?`
      : `Move ${selectedFileIds.length} items to trash?`;

    if (!confirm(confirmMsg)) return;

    try {
      await Promise.all(
        selectedFileIds.map(id =>
          fetch(`/api/files/${id}?permanent=${isTrash}`, { method: 'DELETE' })
        )
      );
      setSelectedFileIds([]);
      fetchData();
      toast(`Deleted ${selectedFileIds.length} items`, 'info');
    } catch (err) {
      toast('Batch delete failed', 'error');
    }
  };

  const handleBatchMove = () => {
    const selected = files.filter(f => selectedFileIds.includes(f.id));
    setFilesToMove(selected);
    setIsMoveOpen(true);
  };

  // Navigation for Lightbox / Player
  const currentPreviewIndex = previewFile
    ? sortedFiles.findIndex(f => f.id === previewFile.id)
    : -1;
  const hasNext = currentPreviewIndex >= 0 && currentPreviewIndex < sortedFiles.length - 1;
  const hasPrev = currentPreviewIndex > 0;

  const handleNextPreview = () => {
    if (hasNext) setPreviewFile(sortedFiles[currentPreviewIndex + 1]);
  };
  const handlePrevPreview = () => {
    if (hasPrev) setPreviewFile(sortedFiles[currentPreviewIndex - 1]);
  };

  const activeFolder = folders.find(f => f.id === selectedFolderId);

  if (authLoading || !user) {
    return (
      <div className="h-screen w-screen bg-[#040711] flex items-center justify-center text-slate-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <p className="text-xs tracking-wider">// INITIALIZING SECURE SESSION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#040711]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentCategory={currentCategory}
        onSelectCategory={cat => {
          setCurrentCategory(cat);
          setSelectedFolderId(null);
          setSelectedFileIds([]);
        }}
        selectedFolderId={selectedFolderId}
        onSelectFolder={fId => {
          setSelectedFolderId(fId);
          setCurrentCategory('all');
          setSelectedFileIds([]);
        }}
        folders={folders}
        stats={stats}
        storageProvider={storageProvider}
        onNewFolder={() => setIsNewFolderOpen(true)}
        onDeleteFolder={handleDeleteFolder}
        onOpenStorageSettings={() => setIsStorageSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenStorageSettings={() => setIsStorageSettingsOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          storageProvider={storageProvider}
          user={user}
        />

        {/* Action Header & Breadcrumb Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#070b18]/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setCurrentCategory('all');
              }}
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              VAULT::{user.name.toUpperCase()}
            </button>

            {currentCategory !== 'all' ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold text-cyan-300 uppercase">
                  {currentCategory === 'favorites' ? 'STARRED_ARCHIVE' : `${currentCategory.toUpperCase()}S`}
                </span>
              </>
            ) : selectedFolderId && activeFolder ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <div className="flex items-center gap-2">
                  <FolderIcon
                    className="w-3.5 h-3.5"
                    style={{ color: activeFolder.color || '#10B981' }}
                  />
                  <span className="font-semibold text-white">{activeFolder.name}</span>
                </div>
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold text-emerald-400">ROOT_DIRECTORY</span>
              </>
            )}

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 ml-1">
              {sortedFiles.length} FILES
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800 text-xs font-mono">
              <span className="px-2 text-slate-500 hidden sm:inline">SORT:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                className="bg-transparent text-slate-300 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="date" className="bg-slate-900 text-slate-200">Date Modified</option>
                <option value="name" className="bg-slate-900 text-slate-200">Name</option>
                <option value="size" className="bg-slate-900 text-slate-200">File Size</option>
              </select>

              <button
                onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
                className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                title={`Order: ${sortOrder.toUpperCase()}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick action buttons */}
            {currentCategory === 'trash' ? (
              <button
                onClick={handleEmptyTrash}
                disabled={files.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-medium disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>PURGE_TRASH</span>
              </button>
            ) : (
              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEW_DIR</span>
              </button>
            )}

            <button
              onClick={() => {
                fetchData();
                toast('Vault telemetry refreshed', 'info');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Selection Sticky Action Bar */}
        {selectedFileIds.length > 0 && (
          <div className="px-6 py-2.5 bg-cyan-950/40 border-b border-cyan-500/30 backdrop-blur-xl flex items-center justify-between font-mono animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-cyan-300">
                [BATCH] {selectedFileIds.length} item{selectedFileIds.length > 1 ? 's' : ''} marked
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-cyan-400 hover:underline"
              >
                {selectedFileIds.length === sortedFiles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchMove}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                <span>Move</span>
              </button>

              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{currentCategory === 'trash' ? 'Purge' : 'Trash'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* Dashboard Telemetry Overview Cards (Hacker Minimalist) */}
          {currentCategory === 'all' && !selectedFolderId && !searchQuery && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {/* Telemetry Card 1 */}
              <div className="p-4 rounded-2xl bg-[#080d1e]/80 border border-cyan-500/20 cyber-card flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    TOTAL_OBJECTS
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {stats?.fileCount || 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Telemetry Card 2 */}
              <div className="p-4 rounded-2xl bg-[#080d1e]/80 border border-emerald-500/20 cyber-card flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    VAULT_USAGE
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {formatBytes(stats?.usedBytes || 0)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Telemetry Card 3 */}
              <div className="p-4 rounded-2xl bg-[#080d1e]/80 border border-purple-500/20 cyber-card flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    ACTIVE_DIRECTORIES
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {folders.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FolderIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Telemetry Card 4 */}
              <div className="p-4 rounded-2xl bg-[#080d1e]/80 border border-amber-500/20 cyber-card flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    SECURITY_STATUS
                  </div>
                  <div className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ENCRYPTED</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Files List / Grid View */}
          {sortedFiles.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#080d1e]/40 border border-slate-800/80">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow-inner">
                <Terminal className="w-8 h-8 text-cyan-500/60" />
              </div>
              <h3 className="text-sm font-semibold font-mono text-slate-200 mb-1">
                {searchQuery ? '[SYS.EMPTY] No matching query results' : '[VAULT_EMPTY] No media stored in this segment'}
              </h3>
              <p className="text-xs text-slate-500 font-mono max-w-sm mb-6">
                {searchQuery
                  ? 'Try searching with a different filename or extension.'
                  : 'Transmit photos, 4K videos, audio waveforms, or documents into your private vault.'}
              </p>
              {!searchQuery && currentCategory !== 'trash' && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-mono"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>TRANSMIT_FILES_NOW</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              files={sortedFiles}
              selectedFileIds={selectedFileIds}
              onToggleSelect={handleToggleSelect}
              onPreview={setPreviewFile}
              onToggleFavorite={handleToggleFavorite}
              onShare={setShareFile}
              onDelete={handleDeleteFile}
              onRename={setFileToRename}
              onMove={file => {
                setFilesToMove([file]);
                setIsMoveOpen(true);
              }}
              folders={folders}
            />
          ) : (
            <FileList
              files={sortedFiles}
              selectedFileIds={selectedFileIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onPreview={setPreviewFile}
              onToggleFavorite={handleToggleFavorite}
              onShare={setShareFile}
              onDelete={handleDeleteFile}
              onMove={file => {
                setFilesToMove([file]);
                setIsMoveOpen(true);
              }}
              folders={folders}
            />
          )}
        </div>
      </div>

      {/* Spotlight Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={setPreviewFile}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewFolder={() => setIsNewFolderOpen(true)}
        onOpenStorageSettings={() => setIsStorageSettingsOpen(true)}
      />

      {/* Media Viewer Lightbox & Player Modal */}
      {previewFile && (
        <MediaViewerModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onShare={file => setShareFile(file)}
          onNext={handleNextPreview}
          onPrev={handlePrevPreview}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchData();
          toast('Files uploaded and indexed in vault', 'success');
        }}
        folders={folders}
        initialFolderId={selectedFolderId}
      />

      {/* Share Modal */}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* Move Files Modal */}
      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => {
          setIsMoveOpen(false);
          setFilesToMove([]);
        }}
        filesToMove={filesToMove}
        folders={folders}
        onMoveSuccess={handleMoveSuccess}
      />

      {/* Rename File Modal */}
      {fileToRename && (
        <RenameModal
          file={fileToRename}
          onClose={() => setFileToRename(null)}
          onRenameSuccess={handleRenameSuccess}
        />
      )}

      {/* Storage Settings Modal */}
      <StorageSettingsModal
        isOpen={isStorageSettingsOpen}
        onClose={() => setIsStorageSettingsOpen(false)}
        onConfigSaved={() => {
          fetchData();
          toast('Storage configuration saved', 'success');
        }}
      />
    </div>
  );
}
