import { NextRequest, NextResponse } from 'next/server';
import { getFileById, updateFile, deleteFile } from '@/lib/db';
import { deleteFileFromStorage } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const file = getFileById(id, user.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ file });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, isFavorite, folderId, isTrash } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (isFavorite !== undefined) updates.isFavorite = isFavorite;
    if (folderId !== undefined) updates.folderId = folderId === 'root' ? null : folderId;
    if (isTrash !== undefined) updates.isTrash = isTrash;

    const updated = updateFile(id, user.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ file: updated, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const file = getFileById(id, user.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    if (permanent && file.s3Key) {
      await deleteFileFromStorage(file.s3Key, file.storageProvider);
    }

    const success = deleteFile(id, user.id, permanent);
    return NextResponse.json({ success, permanent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
