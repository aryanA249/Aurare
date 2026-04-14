import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { writeSiteContentToStore } from "@/lib/content-store";
import { mergeWithDefaultSiteContent, type SiteContent } from "@/lib/site-content";

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const isAuthed = await verifyAdminSessionToken(token);
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = (await request.json().catch(() => null)) as Partial<SiteContent> | null;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const safeContent = mergeWithDefaultSiteContent(payload);

  try {
    await writeSiteContentToStore(safeContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
