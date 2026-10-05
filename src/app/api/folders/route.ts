import { NextRequest, NextResponse } from 'next/server';
import { getFolders, addFolder, deleteFolder } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { Folder } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folders = getFolders(user.id);
    return NextResponse.json({ folders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId, color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const newFolder: Folder = {
      id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      name: name.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      color: color || '#3B82F6',
    };

    addFolder(newFolder);
    return NextResponse.json({ folder: newFolder, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder id is required' }, { status: 400 });
    }

    const success = deleteFolder(id, user.id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
