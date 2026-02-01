import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminDb, isAdminConfigured } from '@/lib/firebase/admin';

export interface ApiAuthResult {
  success: true;
  userId: string;
  email: string;
} | {
  success: false;
  error: string;
  status: number;
};

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new API key (32 random bytes, hex encoded)
 */
export function generateApiKey(): { key: string; hash: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = 'sk_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const hash = hashApiKey(key);
  return { key, hash };
}

/**
 * Validate API key from request header
 * Returns user info if valid, error otherwise
 */
export async function validateApiKey(req: NextRequest): Promise<ApiAuthResult> {
  if (!isAdminConfigured || !adminDb) {
    return {
      success: false,
      error: 'API not configured',
      status: 503,
    };
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return {
      success: false,
      error: 'Missing Authorization header',
      status: 401,
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Invalid Authorization header format. Use: Bearer <api-key>',
      status: 401,
    };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return {
      success: false,
      error: 'Invalid API key format',
      status: 401,
    };
  }

  const keyHash = hashApiKey(apiKey);

  // Find user with this API key hash
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('apiKeyHash', '==', keyHash).get();

  if (snapshot.empty) {
    return {
      success: false,
      error: 'Invalid API key',
      status: 401,
    };
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  // Update last used timestamp (fire and forget)
  userDoc.ref.update({
    apiKeyLastUsed: new Date(),
  }).catch(() => {});

  return {
    success: true,
    userId: userDoc.id,
    email: userData.email,
  };
}

/**
 * Check if user can access a store (owner or shared)
 */
export async function canAccessStore(userId: string, storeId: string): Promise<boolean> {
  if (!adminDb) return false;

  const storeDoc = await adminDb.doc(`stores/${storeId}`).get();
  if (!storeDoc.exists) return false;

  const store = storeDoc.data();
  if (!store) return false;

  return store.ownerId === userId || 
         (store.sharedWith && store.sharedWith.includes(userId));
}

/**
 * Helper to create error response
 */
export function apiError(error: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { message: error } },
    { status }
  );
}

/**
 * Helper to create success response
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Wrapper for API route handlers with auth
 */
export function withApiAuth(
  handler: (
    req: NextRequest,
    context: { params: Record<string, string>; userId: string; email: string }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, { params }: { params: Record<string, string> }) => {
    const auth = await validateApiKey(req);
    
    if (!auth.success) {
      return apiError(auth.error, auth.status);
    }

    return handler(req, { params, userId: auth.userId, email: auth.email });
  };
}
