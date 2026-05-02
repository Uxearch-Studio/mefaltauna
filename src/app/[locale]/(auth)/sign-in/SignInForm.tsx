"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendMagicLinkAction, type SignInState } from "./actions";

type Props = {
  locale: string;
  next?: string;
  initialError?: string;
};

const INITIAL: SignInState = {};

export function SignInForm({ locale, next, initialError }: Props) {
  const t = useTranslations("signIn");
  const [state, action, pending] = useActionState(sendMagicLinkAction, INITIAL);
  const error = state.error ?? initialError;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("emailLabel")}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="hola@correo.com"
          className="h-12 px-4 rounded-xl bg-background border border-border text-base focus:outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-12 px-5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? t("sending") : t("submit")}
      </button>

      {error && (
        <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
          {t(`errors.${error}`)}
        </p>
      )}
    </form>
  );
}
