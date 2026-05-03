"use client";

import { useActionState, useState } from "react";
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

  const initialChar =
    (initial.first_name ?? initial.username ?? "?").charAt(0).toUpperCase();

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

      <AvatarUpload
        value={avatarUrl}
        initialFallback={initialChar}
        onChange={setAvatarUrl}
      />

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
        <div className="surface-card p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {t("emailLabel")}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {initial.email}
          </span>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
          {t(`errors.${state.error}`)}
        </p>
      )}

      {state.ok && (
        <p className="text-sm text-accent">{t("saved")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 px-5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? t("saving") : t("save")}
      </button>
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
