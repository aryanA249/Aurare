import { NextResponse } from "next/server";
import { isRemoteStoreConfigured, readSiteContentFromStore } from "@/lib/content-store";
import { defaultSiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    const content = await readSiteContentFromStore();
    const configured = isRemoteStoreConfigured();

    return NextResponse.json(
      { content, configured },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { content: defaultSiteContent, configured: false },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
