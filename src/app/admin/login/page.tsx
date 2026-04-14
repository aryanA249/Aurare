"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseClientAuth, isFirebaseClientConfigured } from "@/lib/firebase-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firebaseReady = useMemo(() => isFirebaseClientConfigured(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firebaseReady) {
      setError("Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* values in .env.local.");
      return;
    }

    const auth = getFirebaseClientAuth();
    if (!auth) {
      setError("Unable to initialize Firebase Auth.");
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await credential.user.getIdToken(true);

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Login failed.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16 md:py-24">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Aurare Admin</p>
        <h1 className="mt-3 font-serif text-4xl text-neutral-900">Sign in</h1>
        <p className="mt-3 text-sm text-neutral-650">
          Use your Firebase Auth admin account to access the content editor.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-neutral-200 bg-white/80 p-5">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
