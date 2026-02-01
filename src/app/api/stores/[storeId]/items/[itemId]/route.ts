import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKeyWithRateLimit, canAccessStore, apiError, apiSuccess } from '@/lib/api/auth';
import { validateItemName } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ storeId: string; itemId: string }>;
}

/**
 * PATCH /api/stores/:storeId/items/:itemId
 * Update an item (check/uncheck, change section, rename)
 * 
 * Body: { checked?: boolean, sectionId?: string, name?: string }
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await validateApiKeyWithRateLimit(req, true);
  if (!auth.success) {
    return apiError(auth.error, auth.status, auth.rateLimitHeaders);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const { storeId, itemId } = await params;
  const { userId } = auth;

  // Check access
  const hasAccess = await canAccessStore(userId, storeId);
  if (!hasAccess) {
    return apiError('Store not found or access denied', 404);
  }

  // Parse body
  let updates: { checked?: boolean; sectionId?: string; name?: string };
  try {
    updates = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Get shopping list
  const listRef = adminDb.doc(`stores/${storeId}/shoppingList/current`);
  const listDoc = await listRef.get();

  if (!listDoc.exists) {
    return apiError('Shopping list not found', 404);
  }

  const listData = listDoc.data();
  const items = listData?.items || [];

  // Find and update item
  const itemIndex = items.findIndex((item: { id: string }) => item.id === itemId);
  if (itemIndex === -1) {
    return apiError('Item not found', 404);
  }

  const item = items[itemIndex];
  
  // Apply updates
  if (updates.checked !== undefined) {
    item.checked = updates.checked;
    if (updates.checked) {
      item.checkedAt = new Date();
    } else {
      delete item.checkedAt;
    }
  }
  if (updates.sectionId !== undefined) {
    item.sectionId = updates.sectionId;
  }
  if (updates.name !== undefined) {
    // Security: Validate item name (length, characters)
    try {
      item.name = validateItemName(updates.name);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'Invalid item name', 400);
    }
  }

  items[itemIndex] = item;

  // Save
  await listRef.update({
    items,
    updatedAt: new Date(),
  });

  return apiSuccess({ item });
}

/**
 * DELETE /api/stores/:storeId/items/:itemId
 * Remove an item from the shopping list
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await validateApiKeyWithRateLimit(req, true);
  if (!auth.success) {
    return apiError(auth.error, auth.status, auth.rateLimitHeaders);
  }

  if (!adminDb) {
    return apiError('Database not configured', 503);
  }

  const { storeId, itemId } = await params;
  const { userId } = auth;

  // Check access
  const hasAccess = await canAccessStore(userId, storeId);
  if (!hasAccess) {
    return apiError('Store not found or access denied', 404);
  }

  // Get shopping list
  const listRef = adminDb.doc(`stores/${storeId}/shoppingList/current`);
  const listDoc = await listRef.get();

  if (!listDoc.exists) {
    return apiError('Shopping list not found', 404);
  }

  const listData = listDoc.data();
  const items = listData?.items || [];

  // Filter out the item
  const newItems = items.filter((item: { id: string }) => item.id !== itemId);

  if (newItems.length === items.length) {
    return apiError('Item not found', 404);
  }

  // Save
  await listRef.update({
    items: newItems,
    updatedAt: new Date(),
  });

  return apiSuccess({ deleted: true });
}
