import { NextRequest, NextResponse } from 'next/server';
import { getStorageConfig, saveStorageConfig, getS3Client } from '@/lib/storage';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { StorageConfig } from '@/lib/types';

export async function GET() {
  try {
    const config = getStorageConfig();
    return NextResponse.json({
      config: {
        provider: config.provider,
        bucket: config.bucket || '',
        region: config.region || '',
        endpoint: config.endpoint || '',
        publicUrlPrefix: config.publicUrlPrefix || '',
        hasAccessKey: !!config.accessKeyId,
        hasSecretKey: !!config.secretAccessKey,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, bucket, region, endpoint, accessKeyId, secretAccessKey, publicUrlPrefix, testOnly } = body;

    const testConfig: StorageConfig = {
      provider: provider || 'local',
      bucket: bucket?.trim(),
      region: region?.trim() || 'auto',
      endpoint: endpoint?.trim() || undefined,
      accessKeyId: accessKeyId?.trim(),
      secretAccessKey: secretAccessKey?.trim(),
      publicUrlPrefix: publicUrlPrefix?.trim() || undefined,
    };

    if (testConfig.provider !== 'local') {
      if (!testConfig.bucket || !testConfig.accessKeyId || !testConfig.secretAccessKey) {
        return NextResponse.json(
          { error: 'Bucket, Access Key ID, and Secret Access Key are required for cloud storage' },
          { status: 400 }
        );
      }

      // Test credentials with a quick ListObjects call
      const client = getS3Client(testConfig);
      if (!client) {
        return NextResponse.json({ error: 'Failed to initialize S3 client' }, { status: 400 });
      }

      try {
        await client.send(
          new ListObjectsV2Command({
            Bucket: testConfig.bucket,
            MaxKeys: 1,
          })
        );
      } catch (s3Err: unknown) {
        const msg = s3Err instanceof Error ? s3Err.message : 'Failed to connect to S3';
        return NextResponse.json({ error: `Connection test failed: ${msg}` }, { status: 400 });
      }
    }

    if (!testOnly) {
      saveStorageConfig(testConfig);
    }

    return NextResponse.json({
      success: true,
      message:
        testConfig.provider === 'local'
          ? 'Switched to Local Filesystem storage'
          : `Connected successfully to ${testConfig.provider.toUpperCase()} bucket "${testConfig.bucket}"!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
