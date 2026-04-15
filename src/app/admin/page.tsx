"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSiteContent } from "@/components/site-content-provider";
import { formatINR } from "@/lib/catalog";
import {
  getFirebaseClientAuth,
  getFirebaseClientStorage,
  isFirebaseClientConfigured,
} from "@/lib/firebase-client";

function updateAt<T>(items: T[], index: number, updater: (item: T) => T) {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

const MAX_IMAGE_DIMENSION = 1800;
const OUTPUT_QUALITY = 0.82;
const STORAGE_UPLOAD_TIMEOUT_MS = 20_000;
const VIDEO_UPLOAD_API_TIMEOUT_MS = 10 * 60_000;
const MAX_HERO_VIDEO_SIZE_MB = 80;
const MAX_HERO_VIDEO_SIZE_BYTES = MAX_HERO_VIDEO_SIZE_MB * 1024 * 1024;

type UploadProgress = {
  percentage: number;
  bytesTransferred: number;
  totalBytes: number;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read image"));
    };
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode image"));
    image.src = dataUrl;
  });
}

async function compressImageFile(file: File) {
  const sourceDataUrl = await fileToDataUrl(file);

  // Keep SVG uploads as-is to preserve vector fidelity.
  if (file.type === "image/svg+xml") {
    return sourceDataUrl;
  }

  const image = await loadImage(sourceDataUrl);
  const ratio = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const targetWidth = Math.max(1, Math.round(image.naturalWidth * ratio));
  const targetHeight = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (context) {
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
  }

  return sourceDataUrl;
}

async function uploadImageToFirebaseStorage(file: File) {
  const storage = getFirebaseClientStorage();
  if (!storage || !isFirebaseClientConfigured()) {
    return null;
  }

  const isSvg = file.type === "image/svg+xml";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${isSvg ? "svg" : "jpg"}`;
  const storageRef = ref(storage, `site-content/${fileName}`);

  const uploadWithTimeout = async (data: Blob | File, contentType: string) => {
    await withTimeout(
      uploadBytes(storageRef, data, { contentType }),
      STORAGE_UPLOAD_TIMEOUT_MS,
      "Image upload timed out",
    );
  };

  if (isSvg) {
    await uploadWithTimeout(file, file.type);
  } else {
    const sourceDataUrl = await fileToDataUrl(file);
    const image = await loadImage(sourceDataUrl);
    const ratio = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const targetWidth = Math.max(1, Math.round(image.naturalWidth * ratio));
    const targetHeight = Math.max(1, Math.round(image.naturalHeight * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (output) => resolve(output ?? new Blob([sourceDataUrl], { type: file.type })),
          "image/jpeg",
          OUTPUT_QUALITY,
        );
      });

      await uploadWithTimeout(blob, "image/jpeg");
    } else {
      await uploadWithTimeout(file, file.type);
    }
  }

  return withTimeout(
    getDownloadURL(storageRef),
    STORAGE_UPLOAD_TIMEOUT_MS,
    "Image URL generation timed out",
  );
}

async function uploadVideoToFirebaseStorage(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
) {
  return withTimeout(
    new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append("video", file);

      const request = new XMLHttpRequest();
      request.open("POST", "/api/admin/upload-video");

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const percentage = Math.round((event.loaded / Math.max(event.total, 1)) * 100);
        onProgress?.({
          percentage: Math.min(99, Math.max(0, percentage)),
          bytesTransferred: event.loaded,
          totalBytes: event.total,
        });
      };

      request.onerror = () => {
        reject(new Error("Network error while uploading video."));
      };

      request.onabort = () => {
        reject(new Error("Video upload was aborted."));
      };

      request.onload = () => {
        const rawResponse = request.responseText;
        let payload: { url?: string; error?: string } | null = null;

        try {
          payload = rawResponse
            ? (JSON.parse(rawResponse) as { url?: string; error?: string })
            : null;
        } catch {
          payload = null;
        }

        if (request.status >= 200 && request.status < 300 && payload?.url) {
          onProgress?.({
            percentage: 100,
            bytesTransferred: file.size,
            totalBytes: file.size,
          });
          resolve(payload.url);
          return;
        }

        if (request.status === 401) {
          reject(new Error("Session expired. Please sign in again."));
          return;
        }

        reject(new Error(payload?.error ?? `Video upload failed (${request.status}).`));
      };

      request.send(formData);
    }),
    VIDEO_UPLOAD_API_TIMEOUT_MS,
    "Video upload timed out. Try a smaller file or stronger connection.",
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { content, setContent, resetContent } = useSiteContent();
  const [message, setMessage] = useState("Edit content, then click Save to publish.");
  const [isSaving, setIsSaving] = useState(false);

  const totalProductValue = useMemo(
    () => content.products.reduce((sum, product) => sum + product.startingPrice, 0),
    [content.products],
  );

  const handleLogout = async () => {
    const auth = getFirebaseClientAuth();
    if (auth) {
      await signOut(auth);
    }

    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (response.status === 401) {
          setMessage("Session expired. Please sign in again.");
          router.push("/admin/login");
          router.refresh();
          return;
        }

        if (response.status === 413) {
          setMessage("Payload too large. Use smaller images or fewer gallery uploads.");
          return;
        }

        if (payload?.error?.toLowerCase().includes("firebase")) {
          setMessage("Saved locally in this browser. Configure Firebase to publish globally.");
          return;
        }

        setMessage(payload?.error ?? "Unable to save changes. Please try again.");
        return;
      }

      setMessage("Changes saved and published.");
    } catch {
      setMessage("Unable to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Aurare Admin</p>
        <h1 className="mt-3 font-serif text-5xl text-neutral-900">Edit the entire site</h1>
        <p className="mt-4 text-neutral-650">
          Update hero copy, collections, fabric stories, products, comparison data, and brand philosophy. All edits persist in this browser.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-neutral-900 px-4 py-2 text-neutral-100 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-neutral-400 px-4 py-2 transition hover:bg-neutral-900 hover:text-neutral-100"
        >
          Logout
        </button>
        <button
          type="button"
          onClick={() => {
            resetContent();
            setMessage("Reset to the default Aurare editorial content.");
          }}
          className="rounded-full border border-neutral-400 px-4 py-2 transition hover:bg-neutral-900 hover:text-neutral-100"
        >
          Reset content
        </button>
        <span>{message}</span>
      </div>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Summary</p>
          <p className="mt-3 font-serif text-3xl text-neutral-900">{content.products.length} products</p>
          <p className="mt-1 text-sm text-neutral-600">{content.collections.length} collections and {content.fabricStories.length} fabric stories</p>
        </article>
        <article className="rounded-2xl border border-neutral-200 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Brand</p>
          <input
            value={content.brandName}
            onChange={(event) => setContent({ ...content, brandName: event.target.value })}
            className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
        </article>
        <article className="rounded-2xl border border-neutral-200 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Pricing Snapshot</p>
          <p className="mt-3 font-serif text-3xl text-neutral-900">{formatINR(totalProductValue)}</p>
          <p className="mt-1 text-sm text-neutral-600">Sum of current base prices</p>
        </article>
      </section>

      <section className="mt-10 grid gap-6">
        <EditablePanel
          title="Hero"
          description="Headline, subtext, CTA label, hero image URL, and hero background video URL."
        >
          <div className="grid gap-4">
            <input
              value={content.heroHeadline}
              onChange={(event) => setContent({ ...content, heroHeadline: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <textarea
              value={content.heroSubtext}
              onChange={(event) => setContent({ ...content, heroSubtext: event.target.value })}
              className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <input
              value={content.heroCta}
              onChange={(event) => setContent({ ...content, heroCta: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <input
              value={content.heroImageUrl}
              onChange={(event) => setContent({ ...content, heroImageUrl: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
              placeholder="Hero image URL"
            />
            <ImageUploadControl
              buttonLabel="Upload Hero Image"
              onUploadStatus={(status) => setMessage(status)}
              onUploaded={(dataUrl) => {
                setContent({ ...content, heroImageUrl: dataUrl });
                setMessage("Hero image uploaded.");
              }}
            />
            <input
              value={content.heroVideoUrl}
              onChange={(event) => setContent({ ...content, heroVideoUrl: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
              placeholder="Hero video URL (Google Drive share link also works)"
            />
            <VideoUploadControl
              buttonLabel="Upload Hero Video"
              onUploadStatus={(status) => setMessage(status)}
              onUploaded={(videoUrl) => {
                setContent({ ...content, heroVideoUrl: videoUrl });
                setMessage("Hero video uploaded.");
              }}
            />
          </div>
        </EditablePanel>

        <EditablePanel title="Editorial Copy" description="Value proposition, sensory line, philosophy, and final CTA.">
          <div className="grid gap-4">
            <input
              value={content.sensoryLine}
              onChange={(event) => setContent({ ...content, sensoryLine: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <textarea
              value={content.philosophy}
              onChange={(event) => setContent({ ...content, philosophy: event.target.value })}
              className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <input
              value={content.finalCta}
              onChange={(event) => setContent({ ...content, finalCta: event.target.value })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </div>
        </EditablePanel>

        <EditablePanel title="Value Proposition" description="Short luxury statements shown on the homepage.">
          <div className="grid gap-3">
            {content.valueProps.map((value, index) => (
              <input
                key={value}
                value={value}
                onChange={(event) =>
                  setContent({
                    ...content,
                    valueProps: updateAt(content.valueProps, index, () => event.target.value),
                  })
                }
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
              />
            ))}
          </div>
        </EditablePanel>

        <EditablePanel title="Collections" description="Name, fabric, description, mood, and card image URL for each collection.">
          <div className="grid gap-4">
            {content.collections.map((collection, index) => (
              <div key={collection.slug} className="rounded-2xl border border-neutral-200 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={collection.name}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          name: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <input
                    value={collection.fabric}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          fabric: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <textarea
                    value={collection.description}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          description: event.target.value,
                        })),
                      })
                    }
                    className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                  />
                  <input
                    value={collection.mood}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          mood: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                  />
                  <input
                    value={collection.imageUrl ?? ""}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          imageUrl: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                    placeholder="Collection image URL"
                  />
                  <ImageUploadControl
                    className="md:col-span-2"
                    buttonLabel="Upload Collection Image"
                    onUploadStatus={(status) => setMessage(status)}
                    onUploaded={(dataUrl) => {
                      setContent({
                        ...content,
                        collections: updateAt(content.collections, index, (item) => ({
                          ...item,
                          imageUrl: dataUrl,
                        })),
                      });
                      setMessage(`${collection.name} image uploaded.`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </EditablePanel>

        <EditablePanel title="Fabric Stories" description="Edit sensory, emotional, and sustainability messaging.">
          <div className="grid gap-4">
            {content.fabricStories.map((story, index) => (
              <div key={story.name} className="rounded-2xl border border-neutral-200 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={story.name}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        fabricStories: updateAt(content.fabricStories, index, (item) => ({
                          ...item,
                          name: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <input
                    value={story.sensory}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        fabricStories: updateAt(content.fabricStories, index, (item) => ({
                          ...item,
                          sensory: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <textarea
                    value={story.emotional}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        fabricStories: updateAt(content.fabricStories, index, (item) => ({
                          ...item,
                          emotional: event.target.value,
                        })),
                      })
                    }
                    className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <textarea
                    value={story.sustainability}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        fabricStories: updateAt(content.fabricStories, index, (item) => ({
                          ...item,
                          sustainability: event.target.value,
                        })),
                      })
                    }
                    className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </EditablePanel>

        <EditablePanel title="Products" description="Edit product naming, fabric, colors, images, price, and product story.">
          <div className="grid gap-4">
            {content.products.map((product, index) => (
              <div key={product.slug} className="rounded-2xl border border-neutral-200 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={product.name}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          name: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                  />
                  <input
                    value={product.fabric}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          fabric: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <input
                    type="number"
                    value={product.startingPrice}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          startingPrice: Number(event.target.value),
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <textarea
                    value={product.description}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          description: event.target.value,
                        })),
                      })
                    }
                    className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                  />
                  <textarea
                    value={product.feelOnSkin}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          feelOnSkin: event.target.value,
                        })),
                      })
                    }
                    className="min-h-24 rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                  />
                  <input
                    value={product.idealSeason}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          idealSeason: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <input
                    value={product.colorVariants.join(", ")}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          colorVariants: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  />
                  <input
                    value={product.imageUrl ?? ""}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          imageUrl: event.target.value,
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                    placeholder="Main product image URL"
                  />
                  <ImageUploadControl
                    className="md:col-span-2"
                    buttonLabel="Upload Main Product Image"
                    onUploadStatus={(status) => setMessage(status)}
                    onUploaded={(dataUrl) => {
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          imageUrl: dataUrl,
                        })),
                      });
                      setMessage(`${product.name} main image uploaded.`);
                    }}
                  />
                  <input
                    value={(product.galleryImages ?? []).join(", ")}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          galleryImages: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 md:col-span-2"
                    placeholder="Gallery image URLs (comma-separated)"
                  />
                  <ImageUploadControl
                    className="md:col-span-2"
                    buttonLabel="Upload Gallery Image (Append)"
                    onUploadStatus={(status) => setMessage(status)}
                    onUploaded={(dataUrl) => {
                      setContent({
                        ...content,
                        products: updateAt(content.products, index, (item) => ({
                          ...item,
                          galleryImages: [...(item.galleryImages ?? []), dataUrl],
                        })),
                      });
                      setMessage(`${product.name} gallery image added.`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </EditablePanel>

        <EditablePanel title="Comparison Table" description="Edit the premium fabric comparison row by row.">
          <div className="grid gap-4">
            {content.fabricComparison.map((row, index) => (
              <div key={row.fabric} className="rounded-2xl border border-neutral-200 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(row).map(([key, value]) => (
                    <input
                      key={key}
                      value={value}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          fabricComparison: updateAt(content.fabricComparison, index, (item) => ({
                            ...item,
                            [key]: event.target.value,
                          })) as typeof content.fabricComparison,
                        })
                      }
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </EditablePanel>
      </section>
    </main>
  );
}

function EditablePanel({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <article className="rounded-3xl border border-neutral-200 bg-white/80 p-5 md:p-6">
      <header>
        <h2 className="font-serif text-3xl text-neutral-900">{title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      </header>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function VideoUploadControl({
  onUploaded,
  onUploadStatus,
  buttonLabel,
  className,
}: Readonly<{
  onUploaded: (videoUrl: string) => void;
  onUploadStatus?: (message: string) => void;
  buttonLabel: string;
  className?: string;
}>) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [uploadStateText, setUploadStateText] = useState<string>("");

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);

    if (file.size > MAX_HERO_VIDEO_SIZE_BYTES) {
      onUploadStatus?.(
        `Video is too large (${Math.ceil(file.size / (1024 * 1024))} MB). Please keep it under ${MAX_HERO_VIDEO_SIZE_MB} MB.`,
      );
      setUploadStateText("Upload blocked: file exceeds size limit.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadStateText("Uploading video...");
    setUploadProgress({ percentage: 0, bytesTransferred: 0, totalBytes: file.size });
    try {
      const uploadedUrl = await uploadVideoToFirebaseStorage(file, (progress) => {
        setUploadProgress(progress);
      });

      onUploaded(uploadedUrl);
      setUploadProgress({ percentage: 100, bytesTransferred: file.size, totalBytes: file.size });
      setUploadStateText("Upload complete.");
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Video upload failed or timed out. Try a smaller file or check Storage rules.";
      setUploadStateText("Upload failed.");
      onUploadStatus?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      event.target.value = "";
    }
  };

  const uploadedMb = uploadProgress
    ? (uploadProgress.bytesTransferred / (1024 * 1024)).toFixed(1)
    : null;
  const totalMb = uploadProgress
    ? (Math.max(uploadProgress.totalBytes, 1) / (1024 * 1024)).toFixed(1)
    : null;

  return (
    <div className={className}>
      <label className="inline-flex cursor-pointer rounded-full border border-neutral-400 px-4 py-2 text-xs tracking-[0.12em] text-neutral-700 transition hover:bg-neutral-900 hover:text-neutral-100">
        {isUploading && uploadProgress
          ? `Uploading... ${uploadProgress.percentage}% (${uploadedMb}/${totalMb} MB)`
          : buttonLabel}
        <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
      </label>
      <p className="mt-2 text-xs text-neutral-600">
        {selectedFileName ? `Selected: ${selectedFileName}` : "No file selected"}
      </p>
      {uploadStateText ? <p className="mt-1 text-xs text-neutral-600">{uploadStateText}</p> : null}
    </div>
  );
}

function ImageUploadControl({
  onUploaded,
  onUploadStatus,
  buttonLabel,
  className,
}: Readonly<{
  onUploaded: (dataUrl: string) => void;
  onUploadStatus?: (message: string) => void;
  buttonLabel: string;
  className?: string;
}>) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageToFirebaseStorage(file);
      const dataUrl = uploadedUrl ?? (await compressImageFile(file));
      onUploaded(dataUrl);
      if (!uploadedUrl) {
        onUploadStatus?.("Firebase Storage unavailable. Image saved as local data URL.");
      }
    } catch {
      const fallbackDataUrl = await compressImageFile(file);
      onUploaded(fallbackDataUrl);
      onUploadStatus?.("Upload failed or timed out. Image saved locally; try again after checking Storage rules.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="inline-flex cursor-pointer rounded-full border border-neutral-400 px-4 py-2 text-xs tracking-[0.12em] text-neutral-700 transition hover:bg-neutral-900 hover:text-neutral-100">
        {isUploading ? "Uploading..." : buttonLabel}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
}
