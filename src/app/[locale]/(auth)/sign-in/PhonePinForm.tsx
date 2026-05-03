"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { phonePinAction, type AuthState } from "./actions";

type Props = {
  locale: string;
  next?: string;
};

const INITIAL: AuthState = {};

export function PhonePinForm({ locale, next }: Props) {
  const t = useTranslations("signIn");
  const [state, action, pending] = useActionState(phonePinAction, INITIAL);

  const formRef = useRef<HTMLFormElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const pinConfirmRef = useRef<HTMLInputElement>(null);

  // After a "needs confirm" bounce, clear the PIN fields and focus the
  // first one — server gave us back the phone, keep it.
  useEffect(() => {
    if (state.needsConfirm) {
      if (pinRef.current) pinRef.current.value = "";
      if (pinConfirmRef.current) pinConfirmRef.current.value = "";
      pinRef.current?.focus();
    }
  }, [state.needsConfirm]);

  const showConfirm = state.needsConfirm === true;

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}

      <Field label={t("phoneLabel")}>
        <div className="flex h-12 rounded-xl border border-border bg-background overflow-hidden focus-within:border-accent">
          <span className="flex items-center px-4 text-sm text-muted-foreground border-r border-border">
            +57
          </span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel-national"
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={13}
            placeholder="300 000 0000"
            defaultValue={state.phone ?? ""}
            className="flex-1 px-3 bg-transparent text-base focus:outline-none"
          />
        </div>
      </Field>

      <Field label={showConfirm ? t("pinNewLabel") : t("pinLabel")}>
        <input
          ref={pinRef}
          type="password"
          name="pin"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          autoComplete={showConfirm ? "new-password" : "current-password"}
          placeholder="••••••"
          className="h-12 px-4 rounded-xl bg-background border border-border text-base text-center tracking-[0.5em] font-mono focus:outline-none focus:border-accent"
        />
      </Field>

      {showConfirm && (
        <Field label={t("pinConfirmLabel")}>
          <input
            ref={pinConfirmRef}
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
      )}

      {state.error && (
        <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
          {t(`errors.${state.error}`)}
        </p>
      )}

      {showConfirm && !state.error && (
        <p className="text-xs text-muted-foreground">{t("newAccountNotice")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 px-5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending
          ? t("pending")
          : showConfirm
            ? t("createAccount")
            : t("continue")}
      </button>

      {!showConfirm && (
        <Link
          href="/recover-pin"
          className="self-center text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          {t("forgotPin")}
        </Link>
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
