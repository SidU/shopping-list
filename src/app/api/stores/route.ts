import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKey, apiError, apiSuccess } from '@/lib/api/auth';

/**
 * GET /api/stores
 * List all stores accessible by the authenticated user
 */
export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.success) {
    return apiError(auth.error, auth.status);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const { userId } = auth;

  // Get owned stores
  const ownedSnapshot = await adminDb
    .collection('stores')
    .where('ownerId', '==', userId)
    .get();

  // Get shared stores
  const sharedSnapshot = await adminDb
    .collection('stores')
    .where('sharedWith', 'array-contains', userId)
    .get();

  const stores: Array<{
    id: string;
    name: string;
    isOwner: boolean;
    sectionsCount: number;
  }> = [];

  ownedSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    stores.push({
      id: doc.id,
      name: data.name,
      isOwner: true,
      sectionsCount: data.sections?.length || 0,
    });
  });

  sharedSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    stores.push({
      id: doc.id,
      name: data.name,
      isOwner: false,
      sectionsCount: data.sections?.length || 0,
    });
  });

  return apiSuccess({ stores });
}
