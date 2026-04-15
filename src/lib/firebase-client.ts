"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function getFirebaseClientConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    appId,
    messagingSenderId,
    measurementId,
  };
}

export function isFirebaseClientConfigured() {
  return Boolean(getFirebaseClientConfig());
}

export function getFirebaseClientApp() {
  const config = getFirebaseClientConfig();
  if (!config) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseClientAuth() {
  const app = getFirebaseClientApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseClientStorage() {
  const app = getFirebaseClientApp();
  return app ? getStorage(app) : null;
}

export function getFirebaseClientFirestore() {
  const app = getFirebaseClientApp();
  return app ? getFirestore(app) : null;
}

export async function getFirebaseClientAnalytics() {
  if (globalThis.window === undefined) {
    return null;
  }

  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }

  const analyticsSupported = await isSupported();
  return analyticsSupported ? getAnalytics(app) : null;
}
