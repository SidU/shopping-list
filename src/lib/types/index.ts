import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Timestamp;
  // API access
  apiKeyHash?: string;           // SHA-256 hash of API key
  apiKeyCreatedAt?: Timestamp;   // When key was generated
  apiKeyLastUsed?: Timestamp;    // Last API request
}

export interface StoreLocation {
  latitude: number;
  longitude: number;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];           // User IDs of users with access
  pendingShares: string[];        // Emails of invited users who haven't signed up
  sections: StoreSection[];
  location?: StoreLocation;       // Optional store location for proximity features
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StoreSection {
  id: string;
  name: string;
  order: number;
}

export interface ShoppingList {
  id: string;
  storeId: string;
  items: ShoppingItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShoppingItem {
  id: string;
  name: string;
  sectionId: string;
  checked: boolean;
  addedBy: string;
  addedAt: Timestamp;
  checkedAt?: Timestamp;
}

export interface LearnedItem {
  id: string;
  storeId: string;
  name: string;
  sectionId: string;
  frequency: number;
  lastUsed: Timestamp;
  createdBy: string;
}

export const DEFAULT_SECTIONS: Omit<StoreSection, 'id'>[] = [
  { name: 'Produce', order: 0 },
  { name: 'Dairy', order: 1 },
  { name: 'Meat & Seafood', order: 2 },
  { name: 'Bakery', order: 3 },
  { name: 'Pantry', order: 4 },
  { name: 'Frozen', order: 5 },
  { name: 'Snacks & Beverages', order: 6 },
  { name: 'Household', order: 7 },
];
