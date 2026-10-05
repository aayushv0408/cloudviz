'use client';

import React from 'react';
import { MediaFile, Folder } from '@/lib/types';
import { FileCard } from './FileCard';

interface FileGridProps {
  files: MediaFile[];
  selectedFileIds: string[];
  onToggleSelect: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
  onToggleFavorite: (file: MediaFile) => void;
  onShare: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  onRename: (file: MediaFile) => void;
  onMove: (file: MediaFile) => void;
  folders: Folder[];
}

export function FileGrid({
  files,
  selectedFileIds,
  onToggleSelect,
  onPreview,
  onToggleFavorite,
  onShare,
  onDelete,
  onRename,
  onMove,
  folders,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {files.map(file => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFileIds.includes(file.id)}
          onToggleSelect={onToggleSelect}
          onPreview={onPreview}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          onDelete={onDelete}
          onRename={onRename}
          onMove={onMove}
          folders={folders}
        />
      ))}
    </div>
  );
}
