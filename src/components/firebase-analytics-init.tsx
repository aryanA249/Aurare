"use client";

import { useEffect } from "react";
import { getFirebaseClientAnalytics } from "@/lib/firebase-client";

export function FirebaseAnalyticsInit() {
  useEffect(() => {
    void getFirebaseClientAnalytics();
  }, []);

  return null;
}
