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

export function ProfileEditor({ locale, initial }: Props) {
  const t = useTranslations("profile");
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if ((avatarUrl ?? "") !== (initial.avatar_url ?? "")) {
      setDirty(true);
    }
  }, [avatarUrl, initial.avatar_url]);

  // Reset dirty after a successful save.
  useEffect(() => {
    if (state.ok) setDirty(false);
  }, [state.ok]);

  const initialChar =
    (initial.first_name ?? initial.username ?? "?").charAt(0).toUpperCase();

  return (
    <form
      action={action}
      onInput={() => setDirty(true)}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

      {/* Identity card */}
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
          onChange={(url) => {
            setAvatarUrl(url);
            setDirty(true);
          }}
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

        <Field label={t("nationalId")}>
          <input
            type="text"
            name="national_id"
            required
            inputMode="numeric"
            defaultValue={initial.national_id}
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>

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

        <Field label={t("whatsapp")}>
          <input
            type="tel"
            name="whatsapp"
            required
            inputMode="tel"
            defaultValue={initial.whatsapp}
            autoComplete="tel"
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>

        {initial.email && (
          <Field label={t("emailLabel")}>
            <p className="h-11 px-3 rounded-xl bg-muted/40 flex items-center text-sm text-muted-foreground truncate">
              {initial.email}
            </p>
          </Field>
        )}
      </section>

      {/* Save bar */}
      {(dirty || state.error || state.ok) && (
        <div className="sticky bottom-24 z-10">
          <div className="surface-card p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {state.error
                ? t(`errors.${state.error}`)
                : state.ok
                  ? t("saved")
                  : t("dirtyHint")}
            </p>
            <button
              type="submit"
              disabled={pending || !dirty}
              className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {pending ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
