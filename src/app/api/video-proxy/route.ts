import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "drive.google.com",
  "docs.google.com",
  "googleusercontent.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]);

function isAllowedVideoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function copyHeaders(source: Headers) {
  const headers = new Headers();
  const passThroughHeaders = [
    "accept",
    "range",
    "if-range",
    "if-none-match",
    "if-modified-since",
    "user-agent",
  ];

  for (const headerName of passThroughHeaders) {
    const headerValue = source.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  return headers;
}

export async function GET(request: NextRequest) {
  const remoteUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!remoteUrl) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  if (!isAllowedVideoUrl(remoteUrl)) {
    return NextResponse.json(
      { error: "Unsupported video URL. Use a Google Drive share link or a trusted Google-hosted URL." },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(remoteUrl, {
      headers: copyHeaders(request.headers),
      redirect: "follow",
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      const text = await upstreamResponse.text().catch(() => "");
      const upstreamDetails = text ? "Upstream said: " + text.slice(0, 200) : "";
      const message = ["Unable to load video from the provided link.", upstreamDetails]
        .filter(Boolean)
        .join(" ")
        .trim();
      return NextResponse.json(
        {
          error: message,
        },
        { status: 502 },
      );
    }

    const responseHeaders = new Headers();
    const allowedResponseHeaders = [
      "content-type",
      "content-length",
      "accept-ranges",
      "content-range",
      "cache-control",
      "etag",
      "last-modified",
    ];

    for (const headerName of allowedResponseHeaders) {
      const headerValue = upstreamResponse.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    }

    responseHeaders.set("Cache-Control", "no-store");

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy failure";
    return NextResponse.json(
      { error: `Video proxy failed: ${message}` },
      { status: 502 },
    );
  }
}
