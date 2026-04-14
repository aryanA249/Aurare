import {
  getFirebaseAdminAuth,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";

export const ADMIN_COOKIE_NAME = "aurare-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function parseAdminEmailList(raw: string | undefined) {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  const allowList = parseAdminEmailList(process.env.ADMIN_EMAILS);
  if (allowList.length > 0) {
    return allowList;
  }

  return parseAdminEmailList(process.env.ADMIN_EMAIL ?? "admin@aurare.local");
}

function isAdminAllowListConfigured() {
  const fromList = parseAdminEmailList(process.env.ADMIN_EMAILS);
  const fromSingle = parseAdminEmailList(process.env.ADMIN_EMAIL);
  return fromList.length > 0 || fromSingle.length > 0;
}

export function isAdminEmail(email: string | undefined | null) {
  if (typeof email !== "string") {
    return false;
  }

  // If no allowlist is configured, allow any Firebase-authenticated user email.
  if (!isAdminAllowListConfigured()) {
    return true;
  }

  return getAdminEmails().includes(email.toLowerCase());
}

export function isFirebaseSessionConfigured() {
  return isFirebaseAdminConfigured();
}

export async function createAdminSessionCookie(idToken: string) {
  const auth = getFirebaseAdminAuth();
  if (!auth) {
    throw new Error("Firebase is not configured");
  }

  return auth.createSessionCookie(idToken, {
    expiresIn: ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export async function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return false;
  }

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    return isAdminEmail(decoded.email);
  } catch {
    return false;
  }
}

export async function verifyAdminIdToken(idToken: string | undefined) {
  if (!idToken) {
    return false;
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return false;
  }

  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    return isAdminEmail(decoded.email);
  } catch {
    return false;
  }
}
