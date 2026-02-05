'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserStores,
  createStore,
  updateStore,
  deleteStore,
  shareStore,
  unshareStore,
  addPendingShare,
  removePendingShare,
  subscribeToStore,
  getUserByEmail,
} from '../firebase/firestore';
import { Store, StoreSection, StoreLocation } from '../types';
import { validateEmail } from '../validation';

export function useStores() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStores = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userStores = await getUserStores(user.id);
      setStores(userStores);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const addStore = async (name: string, location?: StoreLocation) => {
    if (!user?.id) throw new Error('Not authenticated');
    const storeId = await createStore(name, user.id, location);
    await fetchStores();
    return storeId;
  };

  const removeStore = async (storeId: string) => {
    await deleteStore(storeId);
    await fetchStores();
  };

  return {
    stores,
    loading,
    error,
    addStore,
    removeStore,
    refresh: fetchStores,
  };
}

export function useStore(storeId: string) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = subscribeToStore(storeId, (storeData) => {
      setStore(storeData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const update = async (data: Partial<Store>) => {
    await updateStore(storeId, data);
  };

  const updateSections = async (sections: StoreSection[]) => {
    await updateStore(storeId, { sections });
  };

  const addSection = async (name: string) => {
    if (!store) return;
    const newSection: StoreSection = {
      id: crypto.randomUUID(),
      name,
      order: store.sections.length,
    };
    await updateStore(storeId, {
      sections: [...store.sections, newSection],
    });
  };

  const removeSection = async (sectionId: string) => {
    if (!store) return;
    const filteredSections = store.sections
      .filter((s) => s.id !== sectionId)
      .map((s, index) => ({ ...s, order: index }));
    await updateStore(storeId, { sections: filteredSections });
  };

  const share = async (email: string) => {
    // Validate email format
    const normalizedEmail = validateEmail(email);

    if (user?.email?.toLowerCase() === normalizedEmail) {
      throw new Error('Cannot share with yourself');
    }

    // Check if already shared or pending
    if (store?.sharedWith.includes(normalizedEmail)) {
      throw new Error('Already shared with this user');
    }
    if (store?.pendingShares?.includes(normalizedEmail)) {
      throw new Error('Invite already sent to this email');
    }

    // Check if user exists
    const targetUser = await getUserByEmail(normalizedEmail);

    if (targetUser) {
      // User exists, share directly
      if (store?.sharedWith.includes(targetUser.id)) {
        throw new Error('Already shared with this user');
      }
      await shareStore(storeId, targetUser.id);
    } else {
      // User doesn't exist, add as pending share
      await addPendingShare(storeId, normalizedEmail);
    }
  };

  const unshare = async (userId: string) => {
    await unshareStore(storeId, userId);
  };

  const cancelPendingShare = async (email: string) => {
    await removePendingShare(storeId, email);
  };

  const isOwner = store?.ownerId === user?.id;

  return {
    store,
    loading,
    error,
    isOwner,
    update,
    updateSections,
    addSection,
    removeSection,
    share,
    unshare,
    cancelPendingShare,
  };
}
