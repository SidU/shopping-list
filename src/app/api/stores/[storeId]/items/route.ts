import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKeyWithRateLimit, canAccessStore, apiError, apiSuccess } from '@/lib/api/auth';
import { FieldValue } from 'firebase-admin/firestore';

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

/**
 * GET /api/stores/:storeId/items
 * List all items in a store's shopping list
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

  // Get shopping list
  const listDoc = await adminDb.doc(`stores/${storeId}/shoppingList/current`).get();
  const listData = listDoc.data();

  const items = listData?.items || [];

  return apiSuccess({ items });
}

/**
 * POST /api/stores/:storeId/items
 * Add one or more items to the shopping list
 * 
 * Body: { name: string, sectionId: string } 
 *   or  { items: Array<{ name: string, sectionId: string }> }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

  // Parse body
  let body: { name?: string; sectionId?: string; items?: Array<{ name: string; sectionId: string }> };
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Normalize to array
  let itemsToAdd: Array<{ name: string; sectionId: string }>;
  if (body.items && Array.isArray(body.items)) {
    itemsToAdd = body.items;
  } else if (body.name) {
    itemsToAdd = [{ name: body.name, sectionId: body.sectionId || '' }];
  } else {
    return apiError('Missing name or items in request body', 400);
  }

  // Security: Limit items per request
  if (itemsToAdd.length > 100) {
    return apiError('Maximum 100 items per request', 400);
  }

  // Validate items
  for (const item of itemsToAdd) {
    if (!item.name || typeof item.name !== 'string') {
      return apiError('Each item must have a name', 400);
    }
    // Security: Limit item name length
    if (item.name.length > 500) {
      return apiError('Item name too long (maximum 500 characters)', 400);
    }
  }

  // Get or create shopping list
  const listRef = adminDb.doc(`stores/${storeId}/shoppingList/current`);
  const listDoc = await listRef.get();

  // Security: Limit total items in list
  const existingItems = listDoc.data()?.items || [];
  if (existingItems.length + itemsToAdd.length > 1000) {
    return apiError(`Shopping list would exceed maximum size (1000 items). Current: ${existingItems.length}, adding: ${itemsToAdd.length}`, 400);
  }

  // Create new items
  const newItems = itemsToAdd.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name.trim(),
    sectionId: item.sectionId || '',
    checked: false,
    addedBy: userId,
    addedAt: new Date(),
  }));

  if (listDoc.exists) {
    // Add to existing list
    await listRef.update({
      items: FieldValue.arrayUnion(...newItems),
      updatedAt: new Date(),
    });
  } else {
    // Create new list
    await listRef.set({
      storeId,
      items: newItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Also update learned items for better suggestions
  for (const item of newItems) {
    if (item.sectionId) {
      await updateLearnedItem(storeId, item.name, item.sectionId, userId);
    }
  }

  return apiSuccess(
    { 
      added: newItems.map((i) => ({ id: i.id, name: i.name, sectionId: i.sectionId })) 
    },
    201
  );
}

/**
 * Update learned items for better section suggestions
 */
async function updateLearnedItem(
  storeId: string,
  name: string,
  sectionId: string,
  userId: string
) {
  if (!adminDb) return;

  const normalizedName = name.toLowerCase().trim();
  const learnedRef = adminDb.collection(`stores/${storeId}/learnedItems`);

  // Check if already exists
  const existing = await learnedRef.where('name', '==', normalizedName).get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.update({
      frequency: FieldValue.increment(1),
      lastUsed: new Date(),
      sectionId, // Update section if changed
    });
  } else {
    await learnedRef.add({
      storeId,
      name: normalizedName,
      sectionId,
      frequency: 1,
      lastUsed: new Date(),
      createdBy: userId,
    });
  }
}
