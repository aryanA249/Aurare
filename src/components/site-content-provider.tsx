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
import {
  defaultSiteContent,
  mergeWithDefaultSiteContent,
  type SiteContent,
} from "@/lib/site-content";

type SiteContentContextValue = {
  content: SiteContent;
  setContent: (updater: SiteContent | ((current: SiteContent) => SiteContent)) => void;
  resetContent: () => void;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);
const LOCAL_DRAFT_KEY = "aurare-site-content-draft";

function readLocalDraft() {
  if (typeof window === "undefined") {
    return defaultSiteContent;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      return defaultSiteContent;
    }

    return mergeWithDefaultSiteContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultSiteContent;
  }
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(defaultSiteContent);
  const hasLoadedInitialContent = useRef(false);

  useEffect(() => {
    if (!hasLoadedInitialContent.current) {
      return;
    }

    try {
      window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(content));
    } catch {
      // Ignore local storage quota and serialization issues.
    }
  }, [content]);

  useEffect(() => {
    let active = true;

    const fetchContent = async () => {
      try {
        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) {
          setContentState(readLocalDraft());
          hasLoadedInitialContent.current = true;
          return;
        }

        const payload = (await response.json()) as {
          content?: Partial<SiteContent>;
          configured?: boolean;
        };

        if (!active) {
          return;
        }

        if (payload.configured && payload.content) {
          setContentState(mergeWithDefaultSiteContent(payload.content));
        } else {
          setContentState(readLocalDraft());
        }

        hasLoadedInitialContent.current = true;
      } catch {
        if (active) {
          setContentState(readLocalDraft());
          hasLoadedInitialContent.current = true;
        }
      }
    };

    fetchContent();

    return () => {
      active = false;
    };
  }, []);

  const setContent = useCallback(
    (updater: SiteContent | ((current: SiteContent) => SiteContent)) => {
      setContentState((current) => (typeof updater === "function" ? updater(current) : updater));
    },
    [],
  );

  const resetContent = useCallback(() => {
    setContentState(defaultSiteContent);
  }, []);

  const value = useMemo(
    () => ({ content, setContent, resetContent }),
    [content, setContent, resetContent],
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
