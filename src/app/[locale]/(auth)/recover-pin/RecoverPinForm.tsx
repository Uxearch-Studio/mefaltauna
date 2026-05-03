"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { recoverPinAction, type RecoverState } from "./actions";

const INITIAL: RecoverState = {};

type Props = { locale: string };

/**
 * Knowledge-based PIN recovery form: WhatsApp + cédula prove ownership,
 * then the user sets a new 6-digit PIN. On success the server action
 * signs them in and redirects to the feed — there's no sucess state
 * to render here, only error states.
 */
export function RecoverPinForm({ locale }: Props) {
  const t = useTranslations("recoverPin");
  const [state, action, pending] = useActionState(recoverPinAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <Field label={t("phoneLabel")}>
        <div className="flex h-12 rounded-xl border border-border bg-background overflow-hidden focus-within:border-accent">
          <span className="flex items-center px-4 text-sm text-muted-foreground border-r border-border">
            +57
          </span>
          <input
            type="tel"
            name="phone"
            required
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={13}
            placeholder="300 000 0000"
            defaultValue={state.phone ?? ""}
            className="flex-1 px-3 bg-transparent text-base focus:outline-none"
          />
        </div>
      </Field>

      <Field label={t("nationalIdLabel")} hint={t("nationalIdHint")}>
        <input
          type="text"
          name="national_id"
          required
          inputMode="numeric"
          pattern="[0-9]{6,12}"
          minLength={6}
          maxLength={12}
          placeholder="00000000"
          defaultValue={state.national_id ?? ""}
          className="h-12 px-4 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
        />
      </Field>

      <Field label={t("newPinLabel")}>
        <input
          type="password"
          name="pin"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••"
          className="h-12 px-4 rounded-xl bg-background border border-border text-base text-center tracking-[0.5em] font-mono focus:outline-none focus:border-accent"
        />
      </Field>

      <Field label={t("confirmPinLabel")}>
        <input
          type="password"
          name="pin_confirm"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••"
          className="h-12 px-4 rounded-xl bg-background border border-border text-base text-center tracking-[0.5em] font-mono focus:outline-none focus:border-accent"
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
        {pending ? t("pending") : t("submit")}
      </button>
    </form>
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
