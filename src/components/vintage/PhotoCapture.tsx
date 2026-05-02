"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  value: string | null;
  onChange: (photoUrl: string | null) => void;
};

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;
const BUCKET = "listing-photos";

export function PhotoCapture({ value, onChange }: Props) {
  const t = useTranslations("photo");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const compressed = await compressImage(file);

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

      const filename = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, compressed, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (uploadError) {
        setError("upload_failed");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      onChange(publicUrl);
    } catch {
      setError("upload_failed");
    } finally {
      setUploading(false);
    }
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function trigger() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInput}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-3 surface-card p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="size-16 shrink-0 object-cover rounded-lg"
          />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-medium">{t("attached")}</p>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={trigger}
                disabled={uploading}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {uploading ? t("uploading") : t("retake")}
              </button>
              <span className="text-border">·</span>
              <button
                type="button"
                onClick={clear}
                disabled={uploading}
                className="text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
              >
                {t("remove")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={trigger}
          disabled={uploading}
          className="flex items-center gap-3 self-start h-11 px-4 rounded-full border border-border bg-background hover:bg-muted hover:border-accent transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="size-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">{t("uploading")}</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="size-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-sm font-medium">{t("takePhoto")}</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-accent">{t(`errors.${error}`)}</p>
      )}
    </div>
  );
}

async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const ratio = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(img, 0, 0, w, h);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode_failed"))),
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
