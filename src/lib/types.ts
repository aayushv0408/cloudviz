export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
  storageQuota: number; // in bytes (e.g. 100 GB)
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface MediaFile {
  id: string;
  userId: string; // File belongs to a specific user
  name: string;
  originalName: string;
  size: number; // in bytes
  mimeType: string;
  mediaType: MediaType;
  url: string; // direct URL or local streaming URL
  thumbnailUrl?: string;
  folderId: string | null; // null means root
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isTrash: boolean;
  storageProvider: 's3' | 'r2' | 'supabase' | 'local';
  s3Key?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // in seconds for video/audio
    codec?: string;
    description?: string;
    tags?: string[];
  };
}

export interface Folder {
  id: string;
  userId: string; // Folder belongs to a specific user
  name: string;
  parentId: string | null; // null means root
  createdAt: string;
  color?: string;
}

export interface ShareLink {
  id: string;
  userId: string;
  token: string;
  fileId: string;
  createdAt: string;
  expiresAt: string | null; // null = never
  allowDownload: boolean;
  requirePassword?: boolean;
  password?: string;
  viewsCount: number;
  downloadsCount: number;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'r2' | 'supabase';
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrlPrefix?: string;
}

export interface StorageStats {
  usedBytes: number;
  totalBytes: number;
  fileCount: number;
  byType: {
    image: { bytes: number; count: number };
    video: { bytes: number; count: number };
    audio: { bytes: number; count: number };
    document: { bytes: number; count: number };
    other: { bytes: number; count: number };
  };
}
