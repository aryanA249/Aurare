import "server-only";

import {
  defaultSiteContent,
  mergeWithDefaultSiteContent,
  type SiteContent,
} from "@/lib/site-content";
import {
  getFirebaseAdminFirestore,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";

const CONTENT_COLLECTION = "site_content";
const CONTENT_DOC_ID = "global";

export function isRemoteStoreConfigured() {
  return isFirebaseAdminConfigured();
}

export async function readSiteContentFromStore(): Promise<SiteContent> {
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) {
    return defaultSiteContent;
  }

  const snapshot = await firestore.collection(CONTENT_COLLECTION).doc(CONTENT_DOC_ID).get();
  if (!snapshot.exists) {
    return defaultSiteContent;
  }

  const data = snapshot.data() as { content?: Partial<SiteContent> } | undefined;
  const contentData = data?.content;
  if (!contentData) {
    return defaultSiteContent;
  }

  return mergeWithDefaultSiteContent(contentData);
}

export async function writeSiteContentToStore(content: SiteContent) {
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) {
    throw new Error("Firebase is not configured");
  }

  await firestore.collection(CONTENT_COLLECTION).doc(CONTENT_DOC_ID).set(
    {
      content,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
