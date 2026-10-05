import { NextRequest, NextResponse } from 'next/server';
import { getShareByToken, incrementDownloadCount } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('pwd');
    const isDownload = searchParams.get('download') === 'true';

    const result = getShareByToken(token);
    if (!result) {
      return NextResponse.json({ error: 'Shared link expired or does not exist' }, { status: 404 });
    }

    const { share, file } = result;

    if (share.requirePassword) {
      if (!password || password !== share.password) {
        return NextResponse.json(
          {
            requirePassword: true,
            error: password ? 'Incorrect password' : 'Password required',
            file: {
              name: file.name,
              size: file.size,
              mediaType: file.mediaType,
            },
          },
          { status: 401 }
        );
      }
    }

    if (isDownload) {
      if (!share.allowDownload) {
        return NextResponse.json({ error: 'Downloads are disabled for this shared link' }, { status: 403 });
      }
      incrementDownloadCount(token);
    }

    return NextResponse.json({
      file,
      share: {
        id: share.id,
        token: share.token,
        allowDownload: share.allowDownload,
        expiresAt: share.expiresAt,
        viewsCount: share.viewsCount,
        downloadsCount: share.downloadsCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
