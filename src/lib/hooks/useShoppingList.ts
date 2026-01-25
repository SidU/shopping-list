'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToShoppingList,
  subscribeToLearnedItems,
  addShoppingItem,
  updateShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  clearAllItems,
  uncheckAllItems,
  addOrUpdateLearnedItem,
} from '../firebase/firestore';
import { ShoppingList, ShoppingItem, LearnedItem } from '../types';

export function useShoppingList(storeId: string) {
  const { user } = useAuth();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    setLoading(true);

    const unsubList = subscribeToShoppingList(storeId, (list) => {
      setShoppingList(list);
      setLoading(false);
    });

    const unsubLearned = subscribeToLearnedItems(storeId, (items) => {
      setLearnedItems(items);
    });

    return () => {
      unsubList();
      unsubLearned();
    };
  }, [storeId]);

  const addItem = useCallback(
    async (name: string, sectionId: string) => {
      if (!user?.id) return;

      // Add to shopping list
      await addShoppingItem(storeId, {
        name: name.trim(),
        sectionId,
        addedBy: user.id,
      });

      // Update learned items
      await addOrUpdateLearnedItem(storeId, name.trim(), sectionId, user.id);
    },
    [storeId, user?.id]
  );

  const toggleItem = useCallback(
    async (itemId: string, checked: boolean) => {
      await updateShoppingItem(storeId, itemId, { checked });
    },
    [storeId]
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      await removeShoppingItem(storeId, itemId);
    },
    [storeId]
  );

  const moveItem = useCallback(
    async (itemId: string, sectionId: string) => {
      await updateShoppingItem(storeId, itemId, { sectionId });
    },
    [storeId]
  );

  const clearChecked = useCallback(async () => {
    await clearCheckedItems(storeId);
  }, [storeId]);

  const clearAll = useCallback(async () => {
    await clearAllItems(storeId);
  }, [storeId]);

  const uncheckAll = useCallback(async () => {
    await uncheckAllItems(storeId);
  }, [storeId]);

  const items = shoppingList?.items || [];
  const checkedCount = items.filter((item) => item.checked).length;
  const uncheckedCount = items.length - checkedCount;

  return {
    items,
    learnedItems,
    loading,
    checkedCount,
    uncheckedCount,
    totalCount: items.length,
    addItem,
    toggleItem,
    deleteItem,
    moveItem,
    clearChecked,
    clearAll,
    uncheckAll,
  };
}
