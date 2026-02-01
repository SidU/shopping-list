import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove,
  Firestore,
} from 'firebase/firestore';
import { db, isConfigured } from './config';
import { User, Store, ShoppingList, ShoppingItem, LearnedItem, StoreSection, DEFAULT_SECTIONS } from '../types';
import { validateEmail } from '../validation';

// Helper to get db with type safety
const getDb = (): Firestore => {
  if (!db) {
    throw new Error('Firebase is not configured. Please set up your environment variables.');
  }
  return db;
};

// Generate unique IDs
export const generateId = () => crypto.randomUUID();

// Users
export const createUser = async (user: Omit<User, 'createdAt'>) => {
  if (!isConfigured) return user.id;

  const database = getDb();
  const userRef = doc(database, 'users', user.id);
  const existingUser = await getDoc(userRef);

  if (!existingUser.exists()) {
    await setDoc(userRef, {
      ...user,
      createdAt: Timestamp.now(),
    });

    // Check for pending shares and convert them to actual shares
    if (user.email) {
      await convertPendingSharesToUser(user.email, user.id);
    }
  }

  return user.id;
};

// Convert pending email shares to actual user shares when a user signs up
const convertPendingSharesToUser = async (email: string, userId: string) => {
  const database = getDb();
  const storesRef = collection(database, 'stores');
  const q = query(storesRef, where('pendingShares', 'array-contains', email.toLowerCase()));
  const snapshot = await getDocs(q);

  for (const storeDoc of snapshot.docs) {
    await updateDoc(doc(database, 'stores', storeDoc.id), {
      pendingShares: arrayRemove(email.toLowerCase()),
      sharedWith: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  if (!isConfigured) return null;

  const database = getDb();
  const userRef = doc(database, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  if (!isConfigured) return null;

  const database = getDb();
  const usersRef = collection(database, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

// Stores
export const createStore = async (name: string, ownerId: string): Promise<string> => {
  const database = getDb();
  const storeId = generateId();
  const sections: StoreSection[] = DEFAULT_SECTIONS.map((section) => ({
    ...section,
    id: generateId(),
  }));

  await setDoc(doc(database, 'stores', storeId), {
    name,
    ownerId,
    sharedWith: [],
    pendingShares: [],
    sections,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Initialize empty shopping list
  await setDoc(doc(database, 'stores', storeId, 'shoppingList', 'current'), {
    storeId,
    items: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return storeId;
};

export const getStore = async (storeId: string): Promise<Store | null> => {
  if (!isConfigured) return null;

  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  const storeSnap = await getDoc(storeRef);

  if (storeSnap.exists()) {
    return { id: storeSnap.id, ...storeSnap.data() } as Store;
  }
  return null;
};

export const getUserStores = async (userId: string): Promise<Store[]> => {
  if (!isConfigured) return [];

  const database = getDb();
  const storesRef = collection(database, 'stores');

  // Get owned stores
  const ownedQuery = query(storesRef, where('ownerId', '==', userId));
  const ownedSnapshot = await getDocs(ownedQuery);

  // Get shared stores
  const sharedQuery = query(storesRef, where('sharedWith', 'array-contains', userId));
  const sharedSnapshot = await getDocs(sharedQuery);

  const stores: Store[] = [];

  ownedSnapshot.docs.forEach((docSnap) => {
    stores.push({ id: docSnap.id, ...docSnap.data() } as Store);
  });

  sharedSnapshot.docs.forEach((docSnap) => {
    stores.push({ id: docSnap.id, ...docSnap.data() } as Store);
  });

  return stores;
};

export const updateStore = async (storeId: string, data: Partial<Store>) => {
  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  await updateDoc(storeRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteStore = async (storeId: string) => {
  const database = getDb();
  await deleteDoc(doc(database, 'stores', storeId));
};

export const shareStore = async (storeId: string, userId: string) => {
  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  await updateDoc(storeRef, {
    sharedWith: arrayUnion(userId),
    updatedAt: Timestamp.now(),
  });
};

export const unshareStore = async (storeId: string, userId: string) => {
  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  await updateDoc(storeRef, {
    sharedWith: arrayRemove(userId),
    updatedAt: Timestamp.now(),
  });
};

export const addPendingShare = async (storeId: string, email: string) => {
  // Validate email format before storing
  const validatedEmail = validateEmail(email);

  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  await updateDoc(storeRef, {
    pendingShares: arrayUnion(validatedEmail),
    updatedAt: Timestamp.now(),
  });
};

export const removePendingShare = async (storeId: string, email: string) => {
  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);
  await updateDoc(storeRef, {
    pendingShares: arrayRemove(email.toLowerCase()),
    updatedAt: Timestamp.now(),
  });
};

// Shopping List
export const getShoppingList = async (storeId: string): Promise<ShoppingList | null> => {
  if (!isConfigured) return null;

  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  if (listSnap.exists()) {
    return { id: listSnap.id, ...listSnap.data() } as ShoppingList;
  }
  return null;
};

export const subscribeToShoppingList = (
  storeId: string,
  callback: (list: ShoppingList | null) => void
) => {
  if (!isConfigured) {
    callback(null);
    return () => {};
  }

  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');

  return onSnapshot(listRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as ShoppingList);
    } else {
      callback(null);
    }
  });
};

export const subscribeToStore = (
  storeId: string,
  callback: (store: Store | null) => void
) => {
  if (!isConfigured) {
    callback(null);
    return () => {};
  }

  const database = getDb();
  const storeRef = doc(database, 'stores', storeId);

  return onSnapshot(storeRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Store);
    } else {
      callback(null);
    }
  });
};

export const addShoppingItem = async (
  storeId: string,
  item: Omit<ShoppingItem, 'id' | 'addedAt' | 'checked'>
) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  const newItem: ShoppingItem = {
    ...item,
    id: generateId(),
    checked: false,
    addedAt: Timestamp.now(),
  };

  if (listSnap.exists()) {
    const currentItems = listSnap.data().items || [];
    await updateDoc(listRef, {
      items: [...currentItems, newItem],
      updatedAt: Timestamp.now(),
    });
  } else {
    await setDoc(listRef, {
      storeId,
      items: [newItem],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  return newItem.id;
};

export const updateShoppingItem = async (
  storeId: string,
  itemId: string,
  updates: Partial<ShoppingItem>
) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  if (listSnap.exists()) {
    const items = listSnap.data().items || [];
    const updatedItems = items.map((item: ShoppingItem) =>
      item.id === itemId
        ? { ...item, ...updates, ...(updates.checked ? { checkedAt: Timestamp.now() } : {}) }
        : item
    );

    await updateDoc(listRef, {
      items: updatedItems,
      updatedAt: Timestamp.now(),
    });
  }
};

export const removeShoppingItem = async (storeId: string, itemId: string) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  if (listSnap.exists()) {
    const items = listSnap.data().items || [];
    const filteredItems = items.filter((item: ShoppingItem) => item.id !== itemId);

    await updateDoc(listRef, {
      items: filteredItems,
      updatedAt: Timestamp.now(),
    });
  }
};

export const clearCheckedItems = async (storeId: string) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  if (listSnap.exists()) {
    const items = listSnap.data().items || [];
    const uncheckedItems = items.filter((item: ShoppingItem) => !item.checked);

    await updateDoc(listRef, {
      items: uncheckedItems,
      updatedAt: Timestamp.now(),
    });
  }
};

export const clearAllItems = async (storeId: string) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');

  await updateDoc(listRef, {
    items: [],
    updatedAt: Timestamp.now(),
  });
};

export const uncheckAllItems = async (storeId: string) => {
  const database = getDb();
  const listRef = doc(database, 'stores', storeId, 'shoppingList', 'current');
  const listSnap = await getDoc(listRef);

  if (listSnap.exists()) {
    const items = listSnap.data().items || [];
    const uncheckedItems = items.map((item: ShoppingItem) => ({
      ...item,
      checked: false,
      checkedAt: undefined,
    }));

    await updateDoc(listRef, {
      items: uncheckedItems,
      updatedAt: Timestamp.now(),
    });
  }
};

// Learned Items
export const getLearnedItems = async (storeId: string): Promise<LearnedItem[]> => {
  if (!isConfigured) return [];

  const database = getDb();
  const itemsRef = collection(database, 'stores', storeId, 'learnedItems');
  const snapshot = await getDocs(itemsRef);

  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as LearnedItem));
};

export const subscribeToLearnedItems = (
  storeId: string,
  callback: (items: LearnedItem[]) => void
) => {
  if (!isConfigured) {
    callback([]);
    return () => {};
  }

  const database = getDb();
  const itemsRef = collection(database, 'stores', storeId, 'learnedItems');

  return onSnapshot(itemsRef, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as LearnedItem));
    callback(items);
  });
};

export const addOrUpdateLearnedItem = async (
  storeId: string,
  name: string,
  sectionId: string,
  userId: string
) => {
  const database = getDb();
  const itemsRef = collection(database, 'stores', storeId, 'learnedItems');
  const normalizedName = name.toLowerCase().trim();

  // Check if item already exists
  const q = query(itemsRef, where('name', '==', normalizedName));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Update existing item
    const existingDoc = snapshot.docs[0];
    const existingData = existingDoc.data();
    await updateDoc(doc(itemsRef, existingDoc.id), {
      frequency: (existingData.frequency || 0) + 1,
      lastUsed: Timestamp.now(),
      sectionId, // Update section if changed
    });
    return existingDoc.id;
  } else {
    // Create new learned item
    const itemId = generateId();
    await setDoc(doc(itemsRef, itemId), {
      storeId,
      name: normalizedName,
      sectionId,
      frequency: 1,
      lastUsed: Timestamp.now(),
      createdBy: userId,
    });
    return itemId;
  }
};

export const updateLearnedItemSection = async (
  storeId: string,
  itemId: string,
  sectionId: string
) => {
  const database = getDb();
  const itemRef = doc(database, 'stores', storeId, 'learnedItems', itemId);
  await updateDoc(itemRef, { sectionId });
};
