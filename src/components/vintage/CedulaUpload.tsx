"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 1500;
const JPEG_QUALITY = 0.85;
const BUCKET = "cedula-docs";

type Props = {
  /** Storage path of the existing photo, when the user already
   *  uploaded one. Triggers preview rendering via signed URL. */
  initialPath: string | null;
  onChange: (path: string | null) => void;
};

/**
 * Cédula photo picker. Mirrors AvatarUpload's two-trigger pattern
 * (camera + gallery) but writes to a PRIVATE bucket and emits a
 * storage path instead of a public URL — the photo is sensitive and
 * any subsequent read needs a signed URL minted server-side.
 *
 * On upload:
 *   1. Compress image to JPEG ≤ 1500×1500.
 *   2. Upload to `cedula-docs/{user.id}/cedula-{timestamp}.jpg`.
 *      Folder prefix matches the storage RLS check.
 *   3. Hand the path back via onChange so the form persists it.
 *   4. Render a small thumbnail (signed URL) so the user can confirm
 *      what they uploaded.
 */
export function CedulaUpload({ initialPath, onChange }: Props) {
  const t = useTranslations("photo");
  const tCedula = useTranslations("cedula");
  const [path, setPath] = useState<string | null>(initialPath);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Pull a signed URL whenever the path changes so the user sees a
  // preview without making the file public.
  useEffect(() => {
    if (!path) {
      setPreviewUrl(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 30) // 30 min — refreshed on next mount
      .then((res: { data: { signedUrl: string } | null }) => {
        if (!cancelled) setPreviewUrl(res.data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("not_configured");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("unauthenticated");
        return;
      }

      const filename = `${user.id}/cedula-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (upErr) {
        setError("upload_failed");
        return;
      }
      setPath(filename);
      onChange(filename);
    } catch {
      setError("upload_failed");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setPath(null);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="w-full max-h-48 object-contain bg-black/60"
          />
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold uppercase tracking-wider">
            ✓ {tCedula("uploaded")}
          </span>
          <button
            type="button"
            onClick={clear}
            disabled={uploading}
            aria-label={t("remove")}
            className="absolute top-2 right-2 size-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 flex flex-col items-center gap-2 text-center">
          <span className="size-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="11" r="2" />
              <path d="M14 9h4M14 13h4M14 17h2" />
            </svg>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tCedula("hint")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M23 7l-7 5 7 5V7zM4 6h13v12H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            <circle cx="9" cy="12" r="3" />
          </svg>
          {t("takePhoto")}
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          {t("gallery")}
        </button>
        {uploading && (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            {t("uploading")}
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {tCedula("privacyNote")}
      </p>

      {error && (
        <p className="text-xs text-red-600 border border-red-600/30 rounded-lg px-3 py-2 bg-red-600/5">
          {t(`errors.${error}`)}
        </p>
      )}
    </div>
  );
}

async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  // Letterbox to fit MAX_DIMENSION on the long edge — preserves the
  // cédula's aspect ratio. Cédulas are wider than tall.
  const ratio = img.width / img.height;
  const w = ratio >= 1
    ? Math.min(MAX_DIMENSION, img.width)
    : Math.min(MAX_DIMENSION, img.height) * ratio;
  const h = ratio >= 1
    ? Math.min(MAX_DIMENSION, img.width) / ratio
    : Math.min(MAX_DIMENSION, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode_failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode_failed"));
    };
    img.src = url;
  });
}
