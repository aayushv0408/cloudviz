'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  File,
  CheckCircle2,
  AlertCircle,
  Folder as FolderIcon,
  CloudUpload,
  Loader2,
  Terminal,
  Cpu,
} from 'lucide-react';
import { Folder } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface UploadItem {
  id: string;
  file: globalThis.File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  folders: Folder[];
  initialFolderId: string | null;
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  folders,
  initialFolderId,
}: UploadModalProps) {
  const [targetFolderId, setTargetFolderId] = useState<string | null>(initialFolderId);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files: globalThis.File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploadQueue(prev => [...prev, ...newItems]);
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const startUploads = async () => {
    setIsUploading(true);

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status === 'completed') continue;

      setUploadQueue(prev =>
        prev.map(it => (it.id === item.id ? { ...it, status: 'uploading', progress: 15 } : it))
      );

      try {
        const presignRes = await fetch('/api/storage/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: item.file.name,
            contentType: item.file.type || 'application/octet-stream',
          }),
        });

        const presignData = await presignRes.json();

        if (presignData.available && presignData.uploadUrl) {
          // Direct Cloud Upload to S3 / R2
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignData.uploadUrl, true);
            xhr.setRequestHeader('Content-Type', item.file.type || 'application/octet-stream');

            xhr.upload.onprogress = e => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 85);
                setUploadQueue(prev =>
                  prev.map(it => (it.id === item.id ? { ...it, progress: 15 + percent } : it))
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Cloud upload status ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error('Cloud upload network error'));
            xhr.send(item.file);
          });

          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.file.name,
              originalName: item.file.name,
              size: item.file.size,
              mimeType: item.file.type || 'application/octet-stream',
              url: presignData.directUrl,
              s3Key: presignData.key,
              folderId: targetFolderId,
            }),
          });
        } else {
          // Server Fallback Upload
          const formData = new FormData();
          formData.append('file', item.file);
          if (targetFolderId) {
            formData.append('folderId', targetFolderId);
          }

          setUploadQueue(prev =>
            prev.map(it => (it.id === item.id ? { ...it, progress: 50 } : it))
          );

          const res = await fetch('/api/files', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Server upload failed');
          }
        }

        setUploadQueue(prev =>
          prev.map(it => (it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it))
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setUploadQueue(prev =>
          prev.map(it =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: errorMsg } : it
          )
        );
      }
    }

    setIsUploading(false);
    onUploadSuccess();
  };

  const allCompleted = uploadQueue.length > 0 && uploadQueue.every(i => i.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#080d1e] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] corner-bracket">
        {/* Terminal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">TRANSMIT::MEDIA_PIPELINE</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-500">// DIRECT_S3_PRESIGNED_OR_LOCAL_STREAM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Destination Selector */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <FolderIcon className="w-4 h-4 text-emerald-400" />
            <span>MOUNT_TARGET:</span>
          </div>
          <select
            value={targetFolderId || ''}
            onChange={e => setTargetFolderId(e.target.value || null)}
            className="bg-slate-900 text-cyan-300 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">ROOT_DIRECTORY (None)</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-mono">
          {/* Cyber Drag & Drop Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all scanline-effect ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99] shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                : 'border-slate-700/80 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200 mb-1">
              [CLICK_TO_BROWSE] or drop files here
            </p>
            <p className="text-[10px] text-slate-500">
              High-res RAW photos, 4K MP4/MKV video streams, lossless WAV audio, and documents
            </p>
          </div>

          {/* Queue List */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>BUFFER_QUEUE ({uploadQueue.length})</span>
                {!isUploading && (
                  <button
                    onClick={() => setUploadQueue([])}
                    className="text-slate-500 hover:text-rose-400 transition-colors text-[10px]"
                  >
                    [CLEAR_ALL]
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {uploadQueue.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <File className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200 truncate block text-xs">
                            {item.file.name}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px] ml-2">
                            {formatBytes(item.file.size)}
                          </span>
                        </div>

                        {/* Neon Progress Bar */}
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${item.progress}%` }}
                            className={`h-full transition-all duration-300 ${
                              item.status === 'completed'
                                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                                : item.status === 'error'
                                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                                : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {item.status === 'error' && (
                        <span title={item.errorMessage}>
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        </span>
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      )}
                      {item.status === 'pending' && !isUploading && (
                        <button
                          onClick={() => removeQueueItem(item.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs transition-colors"
          >
            {allCompleted ? 'CLOSE' : 'CANCEL'}
          </button>

          {allCompleted ? (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              DONE_INDEXING
            </button>
          ) : (
            <button
              disabled={uploadQueue.length === 0 || isUploading}
              onClick={startUploads}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>TRANSMIT {uploadQueue.length > 0 ? `(${uploadQueue.length})` : ''}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
