import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKeyWithRateLimit, canAccessStore, apiError, apiSuccess } from '@/lib/api/auth';

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

/**
 * GET /api/stores/:storeId
 * Get store details including sections
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await validateApiKeyWithRateLimit(req, true);
  if (!auth.success) {
    return apiError(auth.error, auth.status, auth.rateLimitHeaders);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const { storeId } = await params;
  const { userId } = auth;

  // Check access
  const hasAccess = await canAccessStore(userId, storeId);
  if (!hasAccess) {
    return apiError('Store not found or access denied', 404);
  }

  // Get store
  const storeDoc = await adminDb.doc(`stores/${storeId}`).get();
  const storeData = storeDoc.data();

  if (!storeData) {
    return apiError('Store not found', 404);
  }

  return apiSuccess({
    store: {
      id: storeDoc.id,
      name: storeData.name,
      isOwner: storeData.ownerId === userId,
      sections: storeData.sections || [],
    },
  });
}
