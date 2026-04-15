"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import {
  defaultSiteContent,
  mergeWithDefaultSiteContent,
  type SiteContent,
} from "@/lib/site-content";
import {
  getFirebaseClientFirestore,
  isFirebaseClientConfigured,
} from "@/lib/firebase-client";

type SiteContentContextValue = {
  content: SiteContent;
  setContent: (updater: SiteContent | ((current: SiteContent) => SiteContent)) => void;
  resetContent: () => void;
  isRemoteConfigured: boolean;
  isContentReady: boolean;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);
const LOCAL_DRAFT_KEY = "aurare-site-content-draft";

function readLocalDraft() {
  if (globalThis.window === undefined) {
    return defaultSiteContent;
  }

  try {
    const raw = globalThis.window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      return defaultSiteContent;
    }

    return mergeWithDefaultSiteContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultSiteContent;
  }
}

export function SiteContentProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [isRemoteConfigured, setIsRemoteConfigured] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const hasLoadedInitialContent = useRef(false);
  const isRemoteContentConfigured = useRef(false);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch("/api/site-content", { cache: "no-store" });
      if (!response.ok) {
        if (!hasLoadedInitialContent.current) {
          setSiteContent(readLocalDraft());
          hasLoadedInitialContent.current = true;
          setIsContentReady(true);
        }
        return;
      }

      const payload = (await response.json()) as {
        content?: Partial<SiteContent>;
        configured?: boolean;
      };

      if (payload.configured) {
        isRemoteContentConfigured.current = true;
        setIsRemoteConfigured(true);
      }

      if (payload.configured && payload.content) {
        setSiteContent(mergeWithDefaultSiteContent(payload.content));
      } else if (!hasLoadedInitialContent.current) {
        setSiteContent(readLocalDraft());
      }

      hasLoadedInitialContent.current = true;
      setIsContentReady(true);
    } catch {
      if (!hasLoadedInitialContent.current) {
        setSiteContent(readLocalDraft());
        hasLoadedInitialContent.current = true;
        setIsContentReady(true);
      }
    }
  }, []);

  const subscribeToRemoteContent = useCallback(() => {
    if (!isFirebaseClientConfigured()) {
      return null;
    }

    const firestore = getFirebaseClientFirestore();
    if (!firestore) {
      return null;
    }

    const remoteDoc = doc(firestore, "site_content", "global");

    return onSnapshot(
      remoteDoc,
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data() as { content?: Partial<SiteContent> } | undefined;
        const remoteContent = data?.content;
        if (remoteContent) {
          isRemoteContentConfigured.current = true;
          setIsRemoteConfigured(true);
          setSiteContent(mergeWithDefaultSiteContent(remoteContent));
          hasLoadedInitialContent.current = true;
          setIsContentReady(true);
        }
      },
      () => {
        // If realtime listening fails, the polling/fetch path will continue to keep data fresh.
      },
    );
  }, []);

  useEffect(() => {
    if (!hasLoadedInitialContent.current) {
      return;
    }

    try {
      globalThis.window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(siteContent));
    } catch {
      // Ignore local storage quota and serialization issues.
    }
  }, [siteContent]);

  useEffect(() => {
    let active = true;

    void fetchContent();

    const unsubscribe = subscribeToRemoteContent();

    const refreshIfRemote = () => {
      if (isRemoteContentConfigured.current && active) {
        void fetchContent();
      }
    };

    const intervalId = globalThis.window.setInterval(refreshIfRemote, 15_000);
    globalThis.window.addEventListener("focus", refreshIfRemote);
    document.addEventListener("visibilitychange", refreshIfRemote);

    return () => {
      active = false;
      unsubscribe?.();
      globalThis.window.clearInterval(intervalId);
      globalThis.window.removeEventListener("focus", refreshIfRemote);
      document.removeEventListener("visibilitychange", refreshIfRemote);
    };
  }, [fetchContent, subscribeToRemoteContent]);

  const setContent = useCallback(
    (updater: SiteContent | ((current: SiteContent) => SiteContent)) => {
      setSiteContent((current) => (typeof updater === "function" ? updater(current) : updater));
    },
    [],
  );

  const resetContent = useCallback(() => {
    setSiteContent(defaultSiteContent);
  }, []);

  const value = useMemo(
    () => ({ content: siteContent, setContent, resetContent, isRemoteConfigured, isContentReady }),
    [siteContent, setContent, resetContent, isRemoteConfigured, isContentReady],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }

  return context;
}

export function getDefaultSiteContent() {
  return defaultSiteContent;
}
