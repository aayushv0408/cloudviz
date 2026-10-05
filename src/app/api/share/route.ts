import { NextRequest, NextResponse } from 'next/server';
import { createShareLink, getFileById } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, expiresInHours, allowDownload, password } = body;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Ensure the file belongs to this user
    const file = getFileById(fileId, user.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    const share = createShareLink({
      userId: user.id,
      fileId,
      expiresInHours: expiresInHours ? Number(expiresInHours) : null,
      allowDownload: allowDownload !== false,
      password: password || undefined,
    });

    return NextResponse.json({ share, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
