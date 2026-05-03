"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/vintage/AvatarUpload";
import {
  updateProfileAction,
  type ProfileEditState,
} from "./actions";

type Props = {
  locale: string;
  initial: {
    username: string | null;
    avatar_url: string | null;
    first_name: string;
    last_name: string;
    national_id: string;
    whatsapp: string;
    city: string;
    email: string | null;
  };
};

const INITIAL: ProfileEditState = {};

/**
 * FIFA-style profile: read-only by default, "Editar" button toggles
 * to edit mode. WhatsApp and cédula are immutable after first set —
 * shown as read-only fields even in edit mode.
 */
export function ProfileEditor({ locale, initial }: Props) {
  const t = useTranslations("profile");
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);

  // Reset edit mode after successful save.
  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state.ok]);

  const initialChar =
    (initial.first_name || initial.username || "?").charAt(0).toUpperCase();

  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        <ReadOnlyView initial={initial} avatarUrl={avatarUrl} initialChar={initialChar} />
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="self-stretch h-12 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("edit")}
        </button>
        {state.ok && (
          <p className="text-xs text-accent text-center">{t("saved")}</p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
      {/* Immutable fields preserved through hidden inputs */}
      <input type="hidden" name="national_id" value={initial.national_id} />
      <input type="hidden" name="whatsapp" value={initial.whatsapp} />

      {/* Identity */}
      <section className="surface-card p-6 flex flex-col gap-5">
        <header className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            {t("identity")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t("identityHint")}
          </span>
        </header>

        <AvatarUpload
          value={avatarUrl}
          initialFallback={initialChar}
          onChange={setAvatarUrl}
        />

        <Field label={t("usernameLabel")}>
          <input
            type="text"
            name="username"
            defaultValue={initial.username ?? ""}
            placeholder={t("usernameHint")}
            maxLength={30}
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>
      </section>

      {/* Contact info */}
      <section className="surface-card p-6 flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            {t("contact")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t("contactHint")}
          </span>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("firstName")}>
            <input
              type="text"
              name="first_name"
              required
              defaultValue={initial.first_name}
              autoComplete="given-name"
              className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label={t("lastName")}>
            <input
              type="text"
              name="last_name"
              required
              defaultValue={initial.last_name}
              autoComplete="family-name"
              className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
            />
          </Field>
        </div>

        <Field label={t("city")}>
          <input
            type="text"
            name="city"
            required
            defaultValue={initial.city}
            autoComplete="address-level2"
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>

        {/* Locked fields — visible but not editable */}
        <Field label={t("nationalId")} locked>
          <p className="h-11 px-3 rounded-xl bg-muted/40 flex items-center text-sm text-muted-foreground truncate">
            {initial.national_id || "—"}
          </p>
        </Field>

        <Field label={t("whatsapp")} locked>
          <p className="h-11 px-3 rounded-xl bg-muted/40 flex items-center text-sm text-muted-foreground truncate">
            {initial.whatsapp || "—"}
          </p>
        </Field>

        {initial.email && (
          <Field label={t("emailLabel")} locked>
            <p className="h-11 px-3 rounded-xl bg-muted/40 flex items-center text-sm text-muted-foreground truncate">
              {initial.email}
            </p>
          </Field>
        )}
      </section>

      {state.error && (
        <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
          {t(`errors.${state.error}`)}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
          className="flex-1 h-12 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 h-12 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

function ReadOnlyView({
  initial,
  avatarUrl,
  initialChar,
}: {
  initial: Props["initial"];
  avatarUrl: string | null;
  initialChar: string;
}) {
  const t = useTranslations("profile");
  const fullName = [initial.first_name, initial.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-4">
      {/* Identity card */}
      <section className="surface-card p-6 flex flex-col gap-5">
        <header>
          <h2 className="text-base font-semibold tracking-tight">
            {t("identity")}
          </h2>
        </header>

        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-20 rounded-full object-cover ring-2 ring-background shadow-md"
            />
          ) : (
            <div className="size-20 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold ring-2 ring-background shadow-md">
              {initialChar}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <p className="text-base font-semibold truncate">
              {fullName || t("noUsername")}
            </p>
            {initial.username && (
              <p className="text-xs text-muted-foreground truncate">
                @{initial.username}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contact card */}
      <section className="surface-card divide-y divide-border">
        <ReadRow label={t("city")} value={initial.city} />
        <ReadRow
          label={t("nationalId")}
          value={initial.national_id}
          masked
          locked
        />
        <ReadRow label={t("whatsapp")} value={initial.whatsapp} masked locked />
        {initial.email && (
          <ReadRow label={t("emailLabel")} value={initial.email} locked />
        )}
      </section>
    </div>
  );
}

function ReadRow({
  label,
  value,
  masked = false,
  locked = false,
}: {
  label: string;
  value: string;
  masked?: boolean;
  locked?: boolean;
}) {
  const display = masked && value ? maskValue(value) : value || "—";
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        {label}
        {locked && (
          <svg
            viewBox="0 0 24 24"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="5" y="11" width="14" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}
      </span>
      <span className="text-sm truncate">{display}</span>
    </div>
  );
}

function maskValue(value: string): string {
  if (value.length <= 4) return value;
  return value.slice(0, 2) + "•".repeat(value.length - 4) + value.slice(-2);
}

function Field({
  label,
  locked,
  children,
}: {
  label: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        {label}
        {locked && (
          <svg
            viewBox="0 0 24 24"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="5" y="11" width="14" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}
      </span>
      {children}
    </label>
  );
}
