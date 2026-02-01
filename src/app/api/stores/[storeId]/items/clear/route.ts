import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKey, canAccessStore, apiError, apiSuccess } from '@/lib/api/auth';

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

/**
 * POST /api/stores/:storeId/items/clear
 * Clear items from the shopping list
 * 
 * Body: { mode: 'checked' | 'all' }
 * - checked: Remove only checked items (default)
 * - all: Remove all items
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await validateApiKey(req);
  if (!auth.success) {
    return apiError(auth.error, auth.status);
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
  let body: { mode?: 'checked' | 'all' } = {};
  try {
    body = await req.json();
  } catch {
    // Default to checked
  }

  const mode = body.mode || 'checked';

  // Get shopping list
  const listRef = adminDb.doc(`stores/${storeId}/shoppingList/current`);
  const listDoc = await listRef.get();

  if (!listDoc.exists) {
    return apiSuccess({ cleared: 0 });
  }

  const listData = listDoc.data();
  const items = listData?.items || [];

  let newItems: unknown[];
  let clearedCount: number;

  if (mode === 'all') {
    newItems = [];
    clearedCount = items.length;
  } else {
    newItems = items.filter((item: { checked: boolean }) => !item.checked);
    clearedCount = items.length - newItems.length;
  }

  // Save
  await listRef.update({
    items: newItems,
    updatedAt: new Date(),
  });

  return apiSuccess({ cleared: clearedCount, remaining: newItems.length });
}
