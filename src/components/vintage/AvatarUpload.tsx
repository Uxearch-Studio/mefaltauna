"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;
const BUCKET = "avatars";

type Props = {
  value: string | null;
  initialFallback: string;
  onChange: (url: string | null) => void;
};

/**
 * Avatar picker with two distinct entry points: camera (uses the
 * front camera on mobile via `capture="user"`) and gallery (omits
 * `capture` so the OS picker presents the photo library + recent
 * photos). On desktop both behave the same — the file dialog opens.
 */
export function AvatarUpload({ value, initialFallback, onChange }: Props) {
  const t = useTranslations("photo");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const blob = await compressToSquare(file);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return setError("not_configured");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError("unauthenticated");

      const filename = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, blob, { contentType: "image/jpeg" });
      if (upErr) return setError("upload_failed");

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filename);
      onChange(publicUrl);
    } catch {
      setError("upload_failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Hidden camera input — browser opens the camera directly */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {/* Hidden gallery input — no capture attr → OS gallery picker */}
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

      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        disabled={uploading}
        className="size-20 rounded-full overflow-hidden bg-foreground text-background flex items-center justify-center text-2xl font-bold hover:opacity-90 transition-opacity relative shrink-0"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          initialFallback
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="size-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </span>
        )}
      </button>

      <div className="flex flex-col gap-2">
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
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="self-start text-xs text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
          >
            {t("remove")}
          </button>
        )}
        {error && <p className="text-xs text-accent">{t(`errors.${error}`)}</p>}
      </div>
    </div>
  );
}

async function compressToSquare(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const size = Math.min(img.width, img.height);
  const target = Math.min(MAX_DIMENSION, size);
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);
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
