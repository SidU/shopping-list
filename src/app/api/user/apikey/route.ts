import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase/admin';
import { generateApiKey, apiError, apiSuccess } from '@/lib/api/auth';

/**
 * POST /api/user/apikey
 * Generate a new API key for the authenticated user
 * Requires session auth (not API key auth)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return apiError('Not authenticated', 401);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const userId = session.user.id;

  // Security: Rate limit key generation (max 1 per hour)
  const userRef = adminDb.doc(`users/${userId}`);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  if (userData?.apiKeyCreatedAt) {
    const createdAt = userData.apiKeyCreatedAt.toDate?.() || new Date(userData.apiKeyCreatedAt);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (createdAt > hourAgo) {
      const waitMinutes = Math.ceil((createdAt.getTime() + 60 * 60 * 1000 - Date.now()) / 60000);
      return apiError(`API key was recently generated. Please wait ${waitMinutes} minutes before generating a new one.`, 429);
    }
  }

  // Generate new key
  const { key, hash } = generateApiKey();

  // Store hash in user document
  await userRef.update({
    apiKeyHash: hash,
    apiKeyCreatedAt: new Date(),
    apiKeyLastUsed: null,
  });

  // Return the raw key (only shown once!)
  return apiSuccess({
    apiKey: key,
    message: 'Save this key securely. It will not be shown again.',
  }, 201);
}

/**
 * DELETE /api/user/apikey
 * Revoke the current API key
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return apiError('Not authenticated', 401);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const userId = session.user.id;

  // Remove API key from user document
  const userRef = adminDb.doc(`users/${userId}`);
  await userRef.update({
    apiKeyHash: null,
    apiKeyCreatedAt: null,
    apiKeyLastUsed: null,
  });

  return apiSuccess({ revoked: true });
}

/**
 * GET /api/user/apikey
 * Check if user has an API key (returns metadata, not the key)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return apiError('Not authenticated', 401);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const userId = session.user.id;

  const userDoc = await adminDb.doc(`users/${userId}`).get();
  const userData = userDoc.data();

  if (!userData?.apiKeyHash) {
    return apiSuccess({ hasKey: false });
  }

  return apiSuccess({
    hasKey: true,
    createdAt: userData.apiKeyCreatedAt?.toDate?.() || null,
    lastUsed: userData.apiKeyLastUsed?.toDate?.() || null,
  });
}
