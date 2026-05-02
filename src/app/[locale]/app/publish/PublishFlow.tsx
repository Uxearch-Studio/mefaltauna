"use client";

import { useActionState, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Sticker } from "@/lib/db";
import { PhotoCapture } from "@/components/vintage/PhotoCapture";
import { publishListingAction, type PublishState } from "./actions";

type Props = {
  duplicates: Sticker[];
  catalog: Sticker[];
  teamCodes: string[];
  locale: string;
};

type ListingType = "trade" | "sale" | "both";
type WantsMode = "any" | "team" | "specific";

const COP = new Intl.NumberFormat("es-CO");
const INITIAL: PublishState = {};

export function PublishFlow({ duplicates, catalog, teamCodes, locale }: Props) {
  const t = useTranslations("publish");
  const [state, action, pending] = useActionState(publishListingAction, INITIAL);

  const [stickerId, setStickerId] = useState<number | null>(
    duplicates[0]?.id ?? null,
  );
  const [type, setType] = useState<ListingType>("trade");
  const [price, setPrice] = useState<string>("");
  const [wantsMode, setWantsMode] = useState<WantsMode>("any");
  const [wantsTeam, setWantsTeam] = useState<string>(teamCodes[0] ?? "");
  const [wantsStickerId, setWantsStickerId] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const wantsTeamOptions = useMemo(
    () => catalog.filter((s) => s.team_code === wantsTeam),
    [catalog, wantsTeam],
  );

  if (duplicates.length === 0) {
    return (
      <div className="surface-card p-8 text-center flex flex-col items-center gap-4">
        <p className="text-base">{t("noDuplicates.title")}</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("noDuplicates.body")}
        </p>
        <Link
          href="/app/album"
          className="inline-flex items-center h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("noDuplicates.cta")}
        </Link>
      </div>
    );
  }

  const showPrice = type === "sale" || type === "both";
  const showWants = type === "trade" || type === "both";

  return (
    <form action={action} className="flex flex-col gap-8">
      <input type="hidden" name="locale" value={locale} />
      {stickerId && (
        <input type="hidden" name="sticker_id" value={stickerId} />
      )}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="wants_mode" value={wantsMode} />
      {wantsMode === "team" && (
        <input type="hidden" name="wants_team_code" value={wantsTeam} />
      )}
      {wantsMode === "specific" && wantsStickerId && (
        <input
          type="hidden"
          name="wants_sticker_id"
          value={wantsStickerId}
        />
      )}
      {photoUrl && (
        <input type="hidden" name="photo_url" value={photoUrl} />
      )}

      {/* Step 1 — pick a duplicate */}
      <Section title={t("step1.title")} subtitle={t("step1.subtitle")}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {duplicates.map((s) => {
            const active = stickerId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStickerId(s.id)}
                className={cn(
                  "aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-1 p-1 transition-all",
                  active
                    ? "bg-accent text-accent-foreground ring-2 ring-accent"
                    : "bg-muted/60 hover:bg-muted",
                )}
                aria-pressed={active}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {s.team_code ?? s.code.split("-")[0]}
                </span>
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {s.number ?? "★"}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Step 1.5 — photo */}
      <Section title={t("photoStep.title")} subtitle={t("photoStep.subtitle")}>
        <PhotoCapture value={photoUrl} onChange={setPhotoUrl} />
      </Section>

      {/* Step 2 — listing type */}
      <Section title={t("step2.title")} subtitle={t("step2.subtitle")}>
        <div className="grid grid-cols-3 gap-2">
          {(["trade", "sale", "both"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setType(opt)}
              className={cn(
                "h-12 rounded-xl text-sm font-medium border transition-colors",
                type === opt
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:bg-muted",
              )}
            >
              {t(`step2.types.${opt}`)}
            </button>
          ))}
        </div>
      </Section>

      {/* Step 3a — price */}
      {showPrice && (
        <Section title={t("step3.priceTitle")} subtitle={t("step3.priceSubtitle")}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <input
              type="text"
              name="price_cop"
              inputMode="numeric"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="0"
              className="w-full h-12 pl-8 pr-16 rounded-xl bg-background border border-border text-base tabular-nums focus:outline-none focus:border-accent"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs uppercase tracking-wide">
              COP
            </span>
          </div>
          {price && (
            <p className="text-xs text-muted-foreground mt-2">
              ${COP.format(Number(price.replace(/[^0-9]/g, "")) || 0)} COP
            </p>
          )}
        </Section>
      )}

      {/* Step 3b — what you want in exchange */}
      {showWants && (
        <Section title={t("step3.wantsTitle")} subtitle={t("step3.wantsSubtitle")}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(["any", "team", "specific"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setWantsMode(opt)}
                className={cn(
                  "h-10 rounded-full text-xs font-medium border transition-colors",
                  wantsMode === opt
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:bg-muted",
                )}
              >
                {t(`step3.wantsModes.${opt}`)}
              </button>
            ))}
          </div>

          {wantsMode === "team" && (
            <select
              value={wantsTeam}
              onChange={(e) => setWantsTeam(e.target.value)}
              className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
            >
              {teamCodes.map((tc) => (
                <option key={tc} value={tc}>
                  {tc}
                </option>
              ))}
            </select>
          )}

          {wantsMode === "specific" && (
            <div className="flex flex-col gap-3">
              <select
                value={wantsTeam}
                onChange={(e) => {
                  setWantsTeam(e.target.value);
                  setWantsStickerId(null);
                }}
                className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
              >
                {teamCodes.map((tc) => (
                  <option key={tc} value={tc}>
                    {tc}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {wantsTeamOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setWantsStickerId(s.id)}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-bold transition-colors tabular-nums",
                      wantsStickerId === s.id
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted/60 text-foreground hover:bg-muted",
                    )}
                  >
                    {s.number ?? "★"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {state.error && (
        <p className="text-sm text-accent border border-accent rounded-xl p-3 bg-accent/5">
          {t(`errors.${state.error}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !stickerId}
        className="h-12 px-6 rounded-full bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}
