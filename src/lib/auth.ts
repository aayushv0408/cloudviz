import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SafeUser } from './types';
import { getUserById } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cloudstore-secret-super-secure-key-2026-media'
);

export const COOKIE_NAME = 'cloudstore_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: {
  userId: string;
  email: string;
  name: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{
  userId: string;
  email: string;
  name: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from request cookies or next/headers cookies
 */
export async function getAuthenticatedUser(request?: NextRequest | Request): Promise<SafeUser | null> {
  let token: string | undefined;

  if (request && 'cookies' in request) {
    // NextRequest
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    // Server component / Route handler using next/headers
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Not in a server context with cookies()
    }
  }

  // Also check Authorization: Bearer <token>
  if (!token && request && request.headers) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session?.userId) return null;

  const user = getUserById(session.userId);
  if (!user) return null;

  // Return safe user without passwordHash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
