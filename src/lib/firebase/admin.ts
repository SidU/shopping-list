import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (server-side only)
let adminApp: App | undefined;
let adminDb: Firestore | undefined;

const isConfigured = !!(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

if (isConfigured) {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
}

export { adminApp, adminDb, isConfigured as isAdminConfigured };
