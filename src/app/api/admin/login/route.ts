import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionCookie,
  verifyAdminIdToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { idToken?: string }
    | null;

  const idToken = payload?.idToken?.trim() ?? "";

  if (!payload || typeof payload.idToken !== "string" || !idToken) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const isAllowed = await verifyAdminIdToken(idToken);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sessionToken = await createAdminSessionCookie(idToken);

  const response = NextResponse.json(
    { ok: true },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
