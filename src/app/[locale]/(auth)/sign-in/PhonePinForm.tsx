"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { phonePinAction, type AuthState } from "./actions";

type Props = {
  locale: string;
  next?: string;
};

const INITIAL: AuthState = {};

export function PhonePinForm({ locale, next }: Props) {
  const t = useTranslations("signIn");
  const [state, action, pending] = useActionState(phonePinAction, INITIAL);

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const pinRef = useRef<HTMLInputElement>(null);
  const pinConfirmRef = useRef<HTMLInputElement>(null);

  // When the server tells us we need confirmation, focus the new field
  // and reset both PIN inputs so the user retypes.
  useEffect(() => {
    if (state.needsConfirm) {
      setPin("");
      setPinConfirm("");
      pinRef.current?.focus();
    }
  }, [state.needsConfirm]);

  // When phone is echoed from server (e.g. on error) prefill it so the
  // user doesn't lose their digits.
  useEffect(() => {
    if (state.phone && !phone) setPhone(state.phone);
  }, [state.phone, phone]);

  const showConfirm = state.needsConfirm === true;

  return (
    <form action={action} className="flex flex-col gap-4">
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
            placeholder="300 000 0000"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 13))
            }
            disabled={showConfirm}
            className="flex-1 px-3 bg-transparent text-base focus:outline-none disabled:text-muted-foreground"
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
          maxLength={6}
          autoComplete={showConfirm ? "new-password" : "current-password"}
          placeholder="••••••"
          value={pin}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPin(digits);
            if (digits.length === 6 && showConfirm) {
              pinConfirmRef.current?.focus();
            }
          }}
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
            maxLength={6}
            autoComplete="new-password"
            placeholder="••••••"
            value={pinConfirm}
            onChange={(e) =>
              setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
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
