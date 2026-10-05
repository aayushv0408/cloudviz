import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageConfig } from './types';

// Default storage directory for local fallback
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage settings file path
const CONFIG_PATH = path.join(process.cwd(), 'data', 'storage-config.json');

export function getStorageConfig(): StorageConfig {
  // Check if persisted config file exists
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Fallback to env
    }
  }

  // Check environment variables
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      provider: 's3',
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT || undefined,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      publicUrlPrefix: process.env.AWS_PUBLIC_URL_PREFIX || undefined,
    };
  }

  // Cloudflare R2
  if (process.env.R2_BUCKET && process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
    return {
      provider: 'r2',
      bucket: process.env.R2_BUCKET,
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      publicUrlPrefix: process.env.R2_PUBLIC_URL_PREFIX || undefined,
    };
  }

  // Default to local storage provider
  return {
    provider: 'local',
  };
}

export function saveStorageConfig(config: StorageConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function getS3Client(config?: StorageConfig): S3Client | null {
  const cfg = config || getStorageConfig();
  if (cfg.provider === 'local' || !cfg.bucket || !cfg.accessKeyId || !cfg.secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: cfg.region || 'auto',
    endpoint: cfg.endpoint || undefined,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    forcePathStyle: cfg.provider === 'r2' || !!cfg.endpoint,
  });
}

/**
 * Generate a Presigned URL for direct client-to-cloud upload
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  config?: StorageConfig
): Promise<{ uploadUrl: string; directUrl: string; key: string } | null> {
  const cfg = config || getStorageConfig();
  const s3 = getS3Client(cfg);

  if (!s3 || !cfg.bucket) {
    return null;
  }

  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const directUrl = cfg.publicUrlPrefix
    ? `${cfg.publicUrlPrefix}/${key}`
    : cfg.endpoint
    ? `${cfg.endpoint}/${cfg.bucket}/${key}`
    : `https://${cfg.bucket}.s3.${cfg.region || 'us-east-1'}.amazonaws.com/${key}`;

  return { uploadUrl, directUrl, key };
}

/**
 * Delete file from storage (Cloud S3 or local)
 */
export async function deleteFileFromStorage(key: string, provider: string): Promise<boolean> {
  if (provider === 'local') {
    const filePath = path.join(UPLOAD_DIR, key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  const cfg = getStorageConfig();
  const s3 = getS3Client(cfg);
  if (!s3 || !cfg.bucket) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
    });
    await s3.send(command);
    return true;
  } catch (err) {
    console.error('Error deleting from S3:', err);
    return false;
  }
}

/**
 * Save file locally (used when uploading through server fallback)
 */
export async function saveFileLocally(
  buffer: Buffer,
  filename: string
): Promise<{ url: string; key: string }> {
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return {
    url: `/uploads/${encodeURIComponent(filename)}`,
    key: filename,
  };
}
