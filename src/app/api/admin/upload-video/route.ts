import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getFirebaseAdminStorage } from "@/lib/firebase-admin";

const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024;

function sanitizeExtension(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? "mp4"
    : "mp4";

  return /^[a-z0-9]+$/.test(extension) ? extension : "mp4";
}

function getPublicDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function getBucketCandidates() {
  const configuredBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  const publicConfiguredBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const publicProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  const normalizeBucketName = (value: string | null | undefined) => {
    if (!value) {
      return null;
    }

    return value.replace(/^gs:\/\//, "").trim();
  };

  const candidates = [
    normalizeBucketName(configuredBucket),
    normalizeBucketName(publicConfiguredBucket),
    projectId ? `${projectId}.appspot.com` : null,
    projectId ? `${projectId}.firebasestorage.app` : null,
    publicProjectId ? `${publicProjectId}.appspot.com` : null,
    publicProjectId ? `${publicProjectId}.firebasestorage.app` : null,
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(candidates));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function isMissingBucketMessage(message: string) {
  return message.toLowerCase().includes("bucket does not exist");
}

async function ensureBucketExists(
  storage: NonNullable<ReturnType<typeof getFirebaseAdminStorage>>,
  bucketName: string,
) {
  const bucket = storage.bucket(bucketName);
  const [exists] = await bucket.exists();
  return { exists, created: false };
}

async function resolveBucketNames(storage: NonNullable<ReturnType<typeof getFirebaseAdminStorage>>) {
  const configuredCandidates = getBucketCandidates();
  const discovered = new Set<string>();
  const diagnostics: string[] = [];

  for (const bucketName of configuredCandidates) {
    try {
      const { exists } = await ensureBucketExists(storage, bucketName);
      if (exists) {
        discovered.add(bucketName);
      } else {
        diagnostics.push(`${bucketName}: The specified bucket does not exist.`);
      }
    } catch (error) {
      diagnostics.push(`${bucketName}: ${getErrorMessage(error)}`);
    }
  }

  return {
    bucketNames: Array.from(discovered),
    checkedCandidates: configuredCandidates,
    diagnostics,
  };
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const isAuthed = await verifyAdminSessionToken(token);
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const storage = getFirebaseAdminStorage();
  if (!storage) {
    return NextResponse.json(
      { error: "Firebase Admin Storage is not configured." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("video");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No video file provided." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      { error: "Empty video file." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Video is too large. Keep it under 80 MB." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: "Invalid file type. Please upload a video." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const extension = sanitizeExtension(file.name);
    const objectPath = `site-content/videos/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const downloadToken = crypto.randomUUID();

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { bucketNames, checkedCandidates, diagnostics } = await resolveBucketNames(storage);
    const uploadErrors: string[] = [];

    let uploadedBucketName: string | null = null;
    for (const bucketName of bucketNames) {
      try {
        const bucket = storage.bucket(bucketName);
        const destination = bucket.file(objectPath);

        await destination.save(fileBuffer, {
          resumable: false,
          metadata: {
            contentType: file.type,
            cacheControl: "public,max-age=31536000,immutable",
            metadata: {
              firebaseStorageDownloadTokens: downloadToken,
            },
          },
        });

        uploadedBucketName = bucket.name;
        break;
      } catch (bucketError) {
        const reason = bucketError instanceof Error ? bucketError.message : "Unknown error";
        uploadErrors.push(`${bucketName}: ${reason}`);
      }
    }

    if (!uploadedBucketName) {
      const allErrors = [...diagnostics, ...uploadErrors];
      const fallbackError = allErrors.length > 0 ? allErrors.join(" | ") : "No bucket candidates available.";
      const allAreMissingBucket = allErrors.length > 0 && allErrors.every(isMissingBucketMessage);

      if (allAreMissingBucket || bucketNames.length === 0) {
        throw new Error(
          `No Cloud Storage bucket exists for this Firebase project. Open Firebase Console > Storage > Get started, then set FIREBASE_STORAGE_BUCKET to the created bucket. Checked: ${checkedCandidates.join(", ") || "(none)"}. Details: ${fallbackError}`,
        );
      }

      throw new Error(
        `Unable to upload to any storage bucket. Checked: ${checkedCandidates.join(", ") || "(none)"}. Details: ${fallbackError}`,
      );
    }

    const url = getPublicDownloadUrl(uploadedBucketName, objectPath, downloadToken);

    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to upload video to Firebase Storage.";

    return NextResponse.json(
      { error: `Upload failed on server: ${message}` },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
