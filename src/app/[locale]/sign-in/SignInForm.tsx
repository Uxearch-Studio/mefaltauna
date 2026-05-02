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
        <span className="font-pixel text-[10px] uppercase text-muted-foreground">
          {t("emailLabel")}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="hola@correo.com"
          className="h-12 px-3 bg-background border-2 border-border font-mono text-base focus:outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-12 px-4 font-pixel text-[10px] uppercase bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-sticker"
      >
        {pending ? t("sending") : t("submit")}
      </button>

      {error && (
        <p className="font-mono text-sm text-accent border-2 border-accent p-3 bg-accent/5">
          {t(`errors.${error}`)}
        </p>
      )}
    </form>
  );
}
