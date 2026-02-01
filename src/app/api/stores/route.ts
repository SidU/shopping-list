import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKeyWithRateLimit, apiError, apiSuccess } from '@/lib/api/auth';
import { validateStoreName } from '@/lib/validation';
import { DEFAULT_SECTIONS } from '@/lib/types';

/**
 * GET /api/stores
 * List all stores accessible by the authenticated user
 */
export async function GET(req: NextRequest) {
  const auth = await validateApiKeyWithRateLimit(req, true);
  if (!auth.success) {
    return apiError(auth.error, auth.status, auth.rateLimitHeaders);
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

/**
 * POST /api/stores
 * Create a new store
 * 
 * Body: { name: string }
 */
export async function POST(req: NextRequest) {
  const auth = await validateApiKeyWithRateLimit(req, true);
  if (!auth.success) {
    return apiError(auth.error, auth.status, auth.rateLimitHeaders);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const { userId } = auth;

  // Parse body
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Validate store name
  if (!body.name || typeof body.name !== 'string') {
    return apiError('Store name is required', 400);
  }

  let storeName: string;
  try {
    storeName = validateStoreName(body.name);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Invalid store name', 400);
  }

  // Security: Limit number of stores per user (prevent abuse)
  const ownedSnapshot = await adminDb
    .collection('stores')
    .where('ownerId', '==', userId)
    .get();

  if (ownedSnapshot.size >= 20) {
    return apiError('Maximum number of stores reached (20). Delete unused stores to create new ones.', 400);
  }

  // Check for duplicate store name (same user)
  const duplicate = ownedSnapshot.docs.find(
    (doc) => doc.data().name.toLowerCase() === storeName.toLowerCase()
  );
  if (duplicate) {
    return apiError(`Store "${storeName}" already exists`, 400);
  }

  // Generate store ID and sections
  const storeId = crypto.randomUUID();
  const sections = DEFAULT_SECTIONS.map((section) => ({
    ...section,
    id: crypto.randomUUID(),
  }));

  // Create store
  await adminDb.doc(`stores/${storeId}`).set({
    name: storeName,
    ownerId: userId,
    sharedWith: [],
    pendingShares: [],
    sections,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Initialize empty shopping list
  await adminDb.doc(`stores/${storeId}/shoppingList/current`).set({
    storeId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return apiSuccess(
    {
      store: {
        id: storeId,
        name: storeName,
        isOwner: true,
        sections,
      },
    },
    201
  );
}
