import { NextRequest, NextResponse } from 'next/server';
import { getFiles, addFile, getStorageStats } from '@/lib/db';
import { getMediaTypeFromMime, sanitizeFilename } from '@/lib/utils';
import { saveFileLocally, getStorageConfig } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';
import { MediaFile } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const mediaType = searchParams.get('type') || undefined;
    const isFavorite = searchParams.get('favorite') === 'true' ? true : undefined;
    const isTrash = searchParams.get('trash') === 'true' ? true : false;
    const search = searchParams.get('search') || undefined;

    const files = getFiles(user.id, {
      folderId: folderId === 'all' || folderId === undefined ? undefined : folderId === 'root' ? null : folderId,
      mediaType,
      isFavorite,
      isTrash,
      search,
    });

    const stats = getStorageStats(user.id);

    return NextResponse.json({ files, stats, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // If client is registering a file that was uploaded directly via S3 Presigned URL
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { name, originalName, size, mimeType, url, s3Key, folderId, metadata } = body;

      const newFile: MediaFile = {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        userId: user.id,
        name: name || originalName,
        originalName,
        size,
        mimeType,
        mediaType: getMediaTypeFromMime(mimeType, originalName),
        url,
        s3Key,
        folderId: folderId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        isTrash: false,
        storageProvider: 's3',
        metadata,
      };

      addFile(newFile);
      return NextResponse.json({ file: newFile, success: true });
    }

    // Direct multipart form upload (server-side processing & local storage fallback)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = (formData.get('folderId') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const originalName = file.name;
    const cleanName = sanitizeFilename(originalName);
    const uniqueFilename = `${user.id}_${Date.now()}_${cleanName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const saved = await saveFileLocally(buffer, uniqueFilename);
    const storageConfig = getStorageConfig();

    const newFile: MediaFile = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: user.id,
      name: originalName,
      originalName,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      mediaType: getMediaTypeFromMime(file.type || '', originalName),
      url: saved.url,
      s3Key: saved.key,
      folderId: folderId === 'root' ? null : folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isTrash: false,
      storageProvider: storageConfig.provider === 'local' ? 'local' : 's3',
    };

    addFile(newFile);
    return NextResponse.json({ file: newFile, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
