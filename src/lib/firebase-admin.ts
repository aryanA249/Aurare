import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let cachedApp: App | null = null;

function getFirebaseAdminCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
    storageBucket,
  };
}

export function isFirebaseAdminConfigured() {
  return Boolean(getFirebaseAdminCredentials());
}

export function getFirebaseAdminApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const credentials = getFirebaseAdminCredentials();
  if (!credentials) {
    return null;
  }

  cachedApp = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
        storageBucket: credentials.storageBucket,
      });

  return cachedApp;
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminFirestore() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseAdminStorage() {
  const app = getFirebaseAdminApp();
  return app ? getStorage(app) : null;
}
