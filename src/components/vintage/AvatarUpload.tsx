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

export function AvatarUpload({ value, initialFallback, onChange }: Props) {
  const t = useTranslations("photo");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
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

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="self-start text-sm font-medium hover:underline disabled:opacity-50"
        >
          {value ? t("retake") : t("takePhoto")}
        </button>
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
