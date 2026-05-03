"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/vintage/AvatarUpload";
import {
  FifaProfileCard,
  Achievements,
  type FifaProfileStats,
} from "@/components/vintage/FifaProfileCard";
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
  stats: FifaProfileStats;
};

const INITIAL: ProfileEditState = {};

/**
 * Profile shell — by default renders the FIFA-style hero card and the
 * achievements grid. Tapping "Edit" expands the form (WhatsApp and
 * cédula stay locked since they're identity-bound).
 */
export function ProfileEditor({ locale, initial, stats }: Props) {
  const t = useTranslations("profile");
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state.ok]);

  const fullName =
    [initial.first_name, initial.last_name].filter(Boolean).join(" ") ||
    initial.username ||
    t("noUsername");
  const initialChar = fullName.charAt(0).toUpperCase();

  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        <FifaProfileCard
          displayName={fullName}
          username={initial.username}
          city={initial.city}
          avatarUrl={avatarUrl}
          initialChar={initialChar}
          stats={stats}
          onEdit={() => setEditing(true)}
        />
        <Achievements stats={stats} />
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
