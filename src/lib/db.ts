import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MediaFile, Folder, ShareLink, StorageStats, User } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cloudstore-db.json');

interface DatabaseSchema {
  users: User[];
  files: MediaFile[];
  folders: Folder[];
  shares: ShareLink[];
}

const DEMO_USER_ID = 'user-demo-1';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: [
        {
          id: DEMO_USER_ID,
          name: 'Alex Morgan',
          email: 'demo@cloudstore.io',
          passwordHash: DEMO_PASSWORD_HASH,
          createdAt: new Date().toISOString(),
          storageQuota: 100 * 1024 * 1024 * 1024, // 100 GB
        },
      ],
      files: [
        {
          id: 'seed-img-1',
          userId: DEMO_USER_ID,
          name: 'Mountain Landscape Sunset',
          originalName: 'mountain-sunset.jpg',
          size: 3420500,
          mimeType: 'image/jpeg',
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
          folderId: 'folder-nature',
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          isFavorite: true,
          isTrash: false,
          storageProvider: 's3',
          metadata: { width: 1920, height: 1080, tags: ['nature', 'sunset', 'mountains'] },
        },
        {
          id: 'seed-img-2',
          userId: DEMO_USER_ID,
          name: 'Cyberpunk Neon Metropolis',
          originalName: 'neon-city.jpg',
          size: 2180000,
          mimeType: 'image/jpeg',
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&auto=format&fit=crop&q=80',
          folderId: null,
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          isFavorite: false,
          isTrash: false,
          storageProvider: 's3',
          metadata: { width: 1600, height: 1200, tags: ['city', 'cyberpunk', 'neon'] },
        },
        {
          id: 'seed-vid-1',
          userId: DEMO_USER_ID,
          name: 'Ocean Waves Drone Footage',
          originalName: 'ocean-waves.mp4',
          size: 14500000,
          mimeType: 'video/mp4',
          mediaType: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          folderId: 'folder-nature',
          createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          isFavorite: true,
          isTrash: false,
          storageProvider: 's3',
          metadata: { duration: 15, width: 1920, height: 1080, tags: ['nature', 'drone', 'video'] },
        },
        {
          id: 'seed-vid-2',
          userId: DEMO_USER_ID,
          name: 'Big Buck Bunny Animation',
          originalName: 'big-buck-bunny.mp4',
          size: 18400000,
          mimeType: 'video/mp4',
          mediaType: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          folderId: null,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          isFavorite: false,
          isTrash: false,
          storageProvider: 's3',
          metadata: { duration: 60, width: 1280, height: 720, tags: ['animation', 'clip'] },
        },
        {
          id: 'seed-aud-1',
          userId: DEMO_USER_ID,
          name: 'Lo-Fi Chill Beats & Ambience',
          originalName: 'lofi-vibes.mp3',
          size: 4850000,
          mimeType: 'audio/mpeg',
          mediaType: 'audio',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          folderId: null,
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          isFavorite: true,
          isTrash: false,
          storageProvider: 's3',
          metadata: { duration: 372, tags: ['music', 'lofi', 'chill'] },
        },
        {
          id: 'seed-doc-1',
          userId: DEMO_USER_ID,
          name: 'Cloud Store Architecture Whitepaper',
          originalName: 'architecture-v2.pdf',
          size: 1540000,
          mimeType: 'application/pdf',
          mediaType: 'document',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          folderId: null,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          isFavorite: false,
          isTrash: false,
          storageProvider: 's3',
          metadata: { tags: ['docs', 'specs', 'pdf'] },
        },
      ],
      folders: [
        {
          id: 'folder-nature',
          userId: DEMO_USER_ID,
          name: 'Nature & Landscapes',
          parentId: null,
          createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          color: '#10B981',
        },
        {
          id: 'folder-projects',
          userId: DEMO_USER_ID,
          name: 'Design Assets & Branding',
          parentId: null,
          createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          color: '#6366F1',
        },
      ],
      shares: [
        {
          id: 'share-1',
          userId: DEMO_USER_ID,
          token: 'share-sample-demo',
          fileId: 'seed-img-1',
          createdAt: new Date().toISOString(),
          expiresAt: null,
          allowDownload: true,
          viewsCount: 24,
          downloadsCount: 9,
        },
      ],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let changed = false;

    // Backward compatibility migrations
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = [
        {
          id: DEMO_USER_ID,
          name: 'Alex Morgan',
          email: 'demo@cloudstore.io',
          passwordHash: DEMO_PASSWORD_HASH,
          createdAt: new Date().toISOString(),
          storageQuota: 100 * 1024 * 1024 * 1024,
        },
      ];
      changed = true;
    }

    // Ensure all existing files/folders have a userId
    parsed.files?.forEach((f: MediaFile) => {
      if (!f.userId) {
        f.userId = DEMO_USER_ID;
        changed = true;
      }
    });

    parsed.folders?.forEach((folder: Folder) => {
      if (!folder.userId) {
        folder.userId = DEMO_USER_ID;
        changed = true;
      }
    });

    parsed.shares?.forEach((s: ShareLink) => {
      if (!s.userId) {
        s.userId = DEMO_USER_ID;
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch {
    return { users: [], files: [], folders: [], shares: [] };
  }
}

function writeDb(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ================= USER OPERATIONS =================

export function getUserByEmail(email: string): User | null {
  const db = ensureDbFile();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export function getUserById(id: string): User | null {
  const db = ensureDbFile();
  return db.users.find(u => u.id === id) || null;
}

export function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  storageQuota?: number;
}): User {
  const db = ensureDbFile();
  const newUser: User = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    avatar: userData.avatar,
    createdAt: new Date().toISOString(),
    storageQuota: userData.storageQuota || 50 * 1024 * 1024 * 1024, // 50 GB default quota
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

// ================= FILE OPERATIONS (PER-USER ISOLATION) =================

export function getFiles(
  userId: string,
  filters?: {
    folderId?: string | null;
    mediaType?: string;
    isFavorite?: boolean;
    isTrash?: boolean;
    search?: string;
  }
): MediaFile[] {
  const db = ensureDbFile();
  // Filter strictly by user
  let files = db.files.filter(f => f.userId === userId);

  if (filters?.isTrash !== undefined) {
    files = files.filter(f => f.isTrash === filters.isTrash);
  } else {
    // Exclude trashed files by default
    files = files.filter(f => !f.isTrash);
  }

  if (filters?.folderId !== undefined) {
    files = files.filter(f => f.folderId === filters.folderId);
  }

  if (filters?.mediaType && filters.mediaType !== 'all') {
    files = files.filter(f => f.mediaType === filters.mediaType);
  }

  if (filters?.isFavorite !== undefined && filters.isFavorite) {
    files = files.filter(f => f.isFavorite === true);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    files = files.filter(
      f =>
        f.name.toLowerCase().includes(term) ||
        f.originalName.toLowerCase().includes(term) ||
        f.metadata?.tags?.some(t => t.toLowerCase().includes(term))
    );
  }

  return files;
}

export function getFileById(id: string, userId?: string): MediaFile | null {
  const db = ensureDbFile();
  const file = db.files.find(f => f.id === id);
  if (!file) return null;
  if (userId && file.userId !== userId) return null;
  return file;
}

export function addFile(file: MediaFile): MediaFile {
  const db = ensureDbFile();
  db.files.unshift(file);
  writeDb(db);
  return file;
}

export function updateFile(
  id: string,
  userId: string,
  updates: Partial<MediaFile>
): MediaFile | null {
  const db = ensureDbFile();
  const index = db.files.findIndex(f => f.id === id && f.userId === userId);
  if (index === -1) return null;

  db.files[index] = {
    ...db.files[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.files[index];
}

export function deleteFile(id: string, userId: string, permanent: boolean = false): boolean {
  const db = ensureDbFile();
  const file = db.files.find(f => f.id === id && f.userId === userId);
  if (!file) return false;

  if (!permanent && !file.isTrash) {
    file.isTrash = true;
    file.updatedAt = new Date().toISOString();
  } else {
    db.files = db.files.filter(f => f.id !== id);
    db.shares = db.shares.filter(s => s.fileId !== id);
  }

  writeDb(db);
  return true;
}

export function emptyTrash(userId: string): number {
  const db = ensureDbFile();
  const count = db.files.filter(f => f.userId === userId && f.isTrash).length;
  db.files = db.files.filter(f => !(f.userId === userId && f.isTrash));
  writeDb(db);
  return count;
}

// ================= FOLDER OPERATIONS (PER-USER ISOLATION) =================

export function getFolders(userId: string, parentId?: string | null): Folder[] {
  const db = ensureDbFile();
  let userFolders = db.folders.filter(f => f.userId === userId);
  if (parentId !== undefined) {
    userFolders = userFolders.filter(f => f.parentId === parentId);
  }
  return userFolders;
}

export function getFolderById(id: string, userId: string): Folder | null {
  const db = ensureDbFile();
  return db.folders.find(f => f.id === id && f.userId === userId) || null;
}

export function addFolder(folder: Folder): Folder {
  const db = ensureDbFile();
  db.folders.push(folder);
  writeDb(db);
  return folder;
}

export function deleteFolder(id: string, userId: string): boolean {
  const db = ensureDbFile();
  const exists = db.folders.some(f => f.id === id && f.userId === userId);
  if (!exists) return false;

  // Move user's files inside folder to root
  db.files.forEach(f => {
    if (f.userId === userId && f.folderId === id) {
      f.folderId = null;
    }
  });

  db.folders = db.folders.filter(f => !(f.id === id && f.userId === userId));
  writeDb(db);
  return true;
}

// ================= SHARE OPERATIONS =================

export function createShareLink(data: {
  userId: string;
  fileId: string;
  expiresInHours?: number | null;
  allowDownload?: boolean;
  password?: string;
}): ShareLink {
  const db = ensureDbFile();
  const token = 'cs_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const now = new Date();
  const expiresAt = data.expiresInHours
    ? new Date(now.getTime() + data.expiresInHours * 3600000).toISOString()
    : null;

  const share: ShareLink = {
    id: 'share-' + Date.now(),
    userId: data.userId,
    token,
    fileId: data.fileId,
    createdAt: now.toISOString(),
    expiresAt,
    allowDownload: data.allowDownload ?? true,
    requirePassword: !!data.password,
    password: data.password || undefined,
    viewsCount: 0,
    downloadsCount: 0,
  };

  db.shares.push(share);
  writeDb(db);
  return share;
}

export function getShareByToken(token: string): { share: ShareLink; file: MediaFile } | null {
  const db = ensureDbFile();
  const share = db.shares.find(s => s.token === token);
  if (!share) return null;

  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return null;
  }

  const file = db.files.find(f => f.id === share.fileId && !f.isTrash);
  if (!file) return null;

  share.viewsCount++;
  writeDb(db);

  return { share, file };
}

export function incrementDownloadCount(token: string): void {
  const db = ensureDbFile();
  const share = db.shares.find(s => s.token === token);
  if (share) {
    share.downloadsCount++;
    writeDb(db);
  }
}

// ================= STORAGE STATS (PER-USER ISOLATION) =================

export function getStorageStats(userId: string): StorageStats {
  const db = ensureDbFile();
  const user = db.users.find(u => u.id === userId);
  const totalAllocatedBytes = user?.storageQuota || 50 * 1024 * 1024 * 1024;
  const activeFiles = db.files.filter(f => f.userId === userId && !f.isTrash);

  const stats: StorageStats = {
    usedBytes: 0,
    totalBytes: totalAllocatedBytes,
    fileCount: activeFiles.length,
    byType: {
      image: { bytes: 0, count: 0 },
      video: { bytes: 0, count: 0 },
      audio: { bytes: 0, count: 0 },
      document: { bytes: 0, count: 0 },
      other: { bytes: 0, count: 0 },
    },
  };

  activeFiles.forEach(file => {
    stats.usedBytes += file.size;
    const type = file.mediaType in stats.byType ? file.mediaType : 'other';
    stats.byType[type].bytes += file.size;
    stats.byType[type].count += 1;
  });

  return stats;
}
