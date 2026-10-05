import { NextRequest, NextResponse } from 'next/server';
import { getStorageConfig, getPresignedUploadUrl } from '@/lib/storage';
import { sanitizeFilename } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const config = getStorageConfig();

    if (config.provider === 'local') {
      return NextResponse.json({
        available: false,
        provider: 'local',
        message: 'Cloud object storage is not configured. Falling back to local upload.',
      });
    }

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    const cleanName = sanitizeFilename(filename);
    const key = `uploads/${Date.now()}_${cleanName}`;

    const presigned = await getPresignedUploadUrl(key, contentType, config);
    if (!presigned) {
      return NextResponse.json(
        { available: false, error: 'Could not generate presigned URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: true,
      provider: config.provider,
      uploadUrl: presigned.uploadUrl,
      directUrl: presigned.directUrl,
      key: presigned.key,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
