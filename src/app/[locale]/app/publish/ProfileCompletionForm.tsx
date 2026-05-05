"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveContactAction, type ContactState } from "./actions";

type Props = {
  locale: string;
};

const INITIAL: ContactState = {};

export function ProfileCompletionForm({ locale }: Props) {
  const t = useTranslations("contact");
  const [state, action, pending] = useActionState(saveContactAction, INITIAL);

  return (
    <div className="surface-card p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("body")}
        </p>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("firstName")}>
            <input
              type="text"
              name="first_name"
              required
              autoComplete="given-name"
              className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label={t("lastName")}>
            <input
              type="text"
              name="last_name"
              required
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
            placeholder={t("nationalIdHint")}
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("city")}>
            <input
              type="text"
              name="city"
              required
              autoComplete="address-level2"
              placeholder="Bogotá"
              className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label={t("neighborhood")} hint={t("neighborhoodHint")}>
            <input
              type="text"
              name="neighborhood"
              required
              autoComplete="address-level3"
              placeholder="Chapinero"
              className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
            />
          </Field>
        </div>

        <Field label={t("whatsapp")}>
          <input
            type="tel"
            name="whatsapp"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="+57 300 000 0000"
            className="h-11 px-3 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
          />
        </Field>

        {state.error && (
          <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
            {t(`errors.${state.error}`)}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 px-5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? t("saving") : t("submit")}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          {t("privacy")}
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}
