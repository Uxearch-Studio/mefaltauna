"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  startCheckoutAction,
  type StartCheckoutState,
} from "./actions";

const INITIAL: StartCheckoutState = {};

type Props = {
  locale: string;
  /** True when the server has WOMPI_* env vars wired in. */
  disabled?: boolean;
};

/**
 * Wraps a form whose action redirects to Wompi Web Checkout. The
 * server action records a PENDING payment row, builds the signed
 * checkout URL, and replies with `redirect()` — the browser jumps
 * straight to Wompi.
 */
export function CheckoutForm({ locale, disabled }: Props) {
  const t = useTranslations("membership");
  const [state, action, pending] = useActionState(
    startCheckoutAction,
    INITIAL,
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        disabled={pending || disabled}
        className="h-12 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(255,199,44,0.35)]"
      >
        {pending ? t("redirecting") : t("payCta")}
        {!pending && (
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        )}
      </button>

      {state.error && (
        <p className="text-xs text-red-500 border border-red-500/40 rounded-xl p-3 bg-red-500/5 leading-snug">
          {t(`errors.${state.error}`)}
        </p>
      )}

      {disabled && !state.error && (
        <p className="text-xs text-muted-foreground text-center">
          {t("errors.wompi_not_configured")}
        </p>
      )}
    </form>
  );
}
