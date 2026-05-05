"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  startTradeAction,
  confirmTradeAction,
  rateTradeAction,
} from "@/app/[locale]/app/inbox/trade-actions";
import type { TradeListingItem } from "@/lib/db";

const COP = new Intl.NumberFormat("es-CO");

type Role = "seller" | "buyer";

type Props = {
  conversationId: string;
  /** Owner of the listing the conversation is about. Defines who's the
   *  seller; the other party is the buyer. */
  sellerId: string | null;
  currentUserId: string;
  /** The listing the conversation was last opened from (the chat's
   *  "current context"). Used as the default-checked item in the
   *  picker so the typical case stays one-click. */
  listingId: string | null;
  /** Latest pending or just-completed trade for this conversation. */
  initialTrade: {
    id: string;
    status: "pending" | "completed";
    qrToken: string | null;
    ratedByMe: boolean;
  } | null;
  /** All of the seller's active listings — picker source. */
  sellerActiveListings: TradeListingItem[];
  /** Listings already bundled into the active trade. */
  tradeItems: TradeListingItem[];
};

export function TradeControls({
  conversationId,
  sellerId,
  currentUserId,
  listingId,
  initialTrade,
  sellerActiveListings,
  tradeItems,
}: Props) {
  const t = useTranslations("trade");
  const router = useRouter();
  const role: Role | null =
    sellerId === currentUserId
      ? "seller"
      : sellerId
        ? "buyer"
        : null;
  const [trade, setTrade] = useState(initialTrade);
  const [showPicker, setShowPicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRating, setShowRating] = useState(
    initialTrade?.status === "completed" && !initialTrade.ratedByMe,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initial selection: the conv's current listing if it's still active,
  // otherwise nothing — the seller will tick what they want manually.
  const initialSelected = (() => {
    const set = new Set<string>();
    if (
      listingId &&
      sellerActiveListings.some((l) => l.id === listingId)
    ) {
      set.add(listingId);
    }
    return set;
  })();
  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  if (!role) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startTrade() {
    setError(null);
    const ids = [...selected];
    console.log("[TradeControls] startTrade clicked", {
      conversationId,
      listingIds: ids,
      role,
    });
    if (ids.length === 0) {
      setError(t("errors.no_listings"));
      return;
    }
    startTransition(async () => {
      const res = await startTradeAction(conversationId, ids);
      console.log("[TradeControls] startTradeAction result", res);
      if (res.ok && res.trade) {
        setTrade({
          id: res.trade.id,
          status: "pending",
          qrToken: res.trade.qrToken,
          ratedByMe: false,
        });
        setShowPicker(false);
        // Server-side revalidate already ran, but refresh so tradeItems
        // reflect the just-bundled selection on next render.
        router.refresh();
      } else if (res.error) {
        setError(t(`errors.${res.error}`));
      }
    });
  }

  function onScanned(token: string) {
    setShowScanner(false);
    setError(null);
    startTransition(async () => {
      const res = await confirmTradeAction(token);
      if (res.ok && res.trade) {
        setTrade({
          id: res.trade.id,
          status: "completed",
          qrToken: null,
          ratedByMe: false,
        });
        setShowRating(true);
        router.refresh();
      } else if (res.error) {
        setError(t(`errors.${res.error}`));
      }
    });
  }

  function onRated() {
    setShowRating(false);
    setTrade((tr) => (tr ? { ...tr, ratedByMe: true } : tr));
    router.refresh();
  }

  const showInlineQr =
    trade?.status === "pending" && role === "seller" && trade.qrToken;

  return (
    <>
      <div className="border-b border-border px-3 py-2 flex items-center justify-between gap-2 bg-muted/30">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("title")}
        </span>

        <div className="flex items-center gap-1.5">
          {!trade && role === "seller" && (
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <path d="M9 9h2v2H9zM13 9v2M9 13v1h5v-3" />
              </svg>
              {showPicker ? t("hidePicker") : t("startCta")}
            </button>
          )}

          {trade?.status === "pending" && role === "buyer" && (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 2H2v2M14 2h-1v0M3 14H2v-2M14 14h-1v0M2 6v4" />
                <rect x="5" y="5" width="6" height="6" rx="1" />
              </svg>
              {t("scanCta")}
            </button>
          )}

          {trade?.status === "completed" && trade.ratedByMe && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
              ✓ {t("closed")}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-3 mt-2 px-3 py-2 text-xs font-medium leading-snug bg-red-600/10 text-red-600 border border-red-600/30 rounded-xl"
        >
          {error}
        </p>
      )}

      {showPicker && !trade && role === "seller" && (
        <ListingPicker
          listings={sellerActiveListings}
          selected={selected}
          onToggle={toggle}
          onActivate={startTrade}
          pending={pending}
        />
      )}

      {showInlineQr && trade.qrToken && (
        <InlineQrCard token={trade.qrToken} items={tradeItems} />
      )}

      {trade?.status === "pending" && role === "buyer" && (
        <BuyerPendingCard items={tradeItems} />
      )}

      {showScanner && (
        <ScannerOverlay
          onClose={() => setShowScanner(false)}
          onScanned={onScanned}
        />
      )}

      {showRating && trade?.status === "completed" && (
        <RatingModal
          tradeId={trade.id}
          onClose={() => setShowRating(false)}
          onRated={onRated}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Listing picker (seller view) — multi-select before activating
// ────────────────────────────────────────────────────────────
function ListingPicker({
  listings,
  selected,
  onToggle,
  onActivate,
  pending,
}: {
  listings: TradeListingItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onActivate: () => void;
  pending: boolean;
}) {
  const t = useTranslations("trade");

  if (listings.length === 0) {
    return (
      <div className="mx-3 mt-3 p-4 rounded-2xl border border-border bg-muted/30 text-center text-xs text-muted-foreground">
        {t("noActiveListings")}
      </div>
    );
  }

  return (
    <div className="mx-3 mt-3 p-4 rounded-2xl border border-border bg-muted/30 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-tight">
          {t("pickerTitle")}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pickerBody")}
        </p>
      </div>
      <ul className="flex flex-col gap-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
        {listings.map((l) => {
          const isOn = selected.has(l.id);
          const stickerLabel =
            (l.sticker.team_code ?? l.sticker.code.split("-")[0]) +
            (l.sticker.number !== null ? ` #${l.sticker.number}` : "") +
            ` · ${l.sticker.name}`;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onToggle(l.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-colors text-left ${
                  isOn
                    ? "border-foreground bg-background"
                    : "border-border hover:bg-background"
                }`}
              >
                <span
                  className={`size-5 shrink-0 rounded-md flex items-center justify-center border ${
                    isOn
                      ? "bg-foreground border-foreground text-background"
                      : "border-border bg-background"
                  }`}
                  aria-hidden
                >
                  {isOn && (
                    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-medium truncate">
                    {stickerLabel}
                  </span>
                  {l.sticker.price_cop !== null && (
                    <span className="block text-[11px] text-muted-foreground tabular-nums">
                      ${COP.format(l.sticker.price_cop)} COP
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onActivate}
        disabled={pending || selected.size === 0}
        className="h-10 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {pending
          ? t("starting")
          : t("activateWithCount", { count: selected.size })}
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Inline QR card (seller view) — also lists what's being settled
// ────────────────────────────────────────────────────────────
function InlineQrCard({
  token,
  items,
}: {
  token: string;
  items: TradeListingItem[];
}) {
  const t = useTranslations("trade");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(token, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 360,
      color: { dark: "#1a0b3d", light: "#ffffff" },
    })
      .then((url) => {
        setDataUrl(url);
        setErr(null);
      })
      .catch((e) => {
        console.error("[InlineQrCard] QR generation failed", e);
        setErr(String(e?.message ?? e ?? "qr_failed"));
      });
  }, [token]);

  return (
    <div className="mx-3 mt-3 mb-1 p-4 rounded-2xl border border-[var(--stage-yellow)]/50 bg-gradient-to-br from-[var(--stage-yellow)]/15 to-transparent flex flex-col items-center gap-3 text-center">
      <h3 className="text-sm font-semibold tracking-tight">
        {t("qrTitle")}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
        {t("qrBody")}
      </p>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 justify-center">
          {items.map((it) => (
            <li
              key={it.id}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-foreground text-background tabular-nums"
            >
              {it.sticker.team_code ?? it.sticker.code.split("-")[0]}
              {it.sticker.number !== null ? ` #${it.sticker.number}` : ""}
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-2xl border border-border p-2 bg-white">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="" className="size-56" />
        ) : (
          <div className="size-56 flex items-center justify-center text-muted-foreground text-xs">
            {err ? `error: ${err}` : "…"}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {t("qrFooter")}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Buyer hint card — what the seller is settling
// ────────────────────────────────────────────────────────────
function BuyerPendingCard({ items }: { items: TradeListingItem[] }) {
  const t = useTranslations("trade");
  return (
    <div className="mx-3 mt-2 px-3 py-3 text-xs leading-snug bg-amber-500/10 text-amber-800 border border-amber-500/30 rounded-xl flex flex-col gap-2">
      <p className="font-medium">{t("buyerHint")}</p>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <li
              key={it.id}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-700 text-white tabular-nums"
            >
              {it.sticker.team_code ?? it.sticker.code.split("-")[0]}
              {it.sticker.number !== null ? ` #${it.sticker.number}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Camera scanner (buyer view)
// ────────────────────────────────────────────────────────────
function ScannerOverlay({
  onClose,
  onScanned,
}: {
  onClose: () => void;
  onScanned: (token: string) => void;
}) {
  const t = useTranslations("trade");
  const [mounted, setMounted] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in"
    >
      <header className="flex items-center justify-between px-4 h-14 text-white">
        <h2 className="text-base font-semibold tracking-tight">
          {t("scannerTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 relative">
        <Scanner
          onScan={(detected) => {
            if (handledRef.current) return;
            const value = detected?.[0]?.rawValue;
            if (!value) return;
            handledRef.current = true;
            onScanned(value);
          }}
          onError={() => {}}
          constraints={{ facingMode: "environment" }}
          allowMultiple={false}
          components={{ finder: true }}
          styles={{
            container: {
              width: "100%",
              height: "100%",
              maxWidth: "100%",
            },
          }}
        />
      </div>

      <footer className="text-white text-center text-sm px-6 py-4 bg-black/60">
        {t("scannerHint")}
      </footer>
    </div>,
    document.body,
  );
}

// ────────────────────────────────────────────────────────────
// Rating modal — football-themed celebration after a completed trade
// ────────────────────────────────────────────────────────────
function RatingModal({
  tradeId,
  onClose,
  onRated,
}: {
  tradeId: string;
  onClose: () => void;
  onRated: () => void;
}) {
  const t = useTranslations("trade");
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await rateTradeAction(tradeId, stars, comment);
      if (res.ok) {
        onRated();
      } else if (res.error) {
        setError(t(`errors.${res.error}`));
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] bg-black/80 flex items-end sm:items-center justify-center p-4"
    >
      <div className="bg-background text-foreground rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl border border-border">
        <div className="relative h-24 flex items-center justify-center mb-1">
          <span aria-hidden className="absolute inset-0 pointer-events-none">
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="absolute size-1.5 rounded-full anim-confetti"
                style={{
                  left: `${(i * 73) % 100}%`,
                  top: `${(i * 37) % 100}%`,
                  background: i % 3 === 0
                    ? "var(--stage-yellow)"
                    : i % 3 === 1
                      ? "var(--accent)"
                      : "#34d399",
                  animationDelay: `${(i * 0.13).toFixed(2)}s`,
                }}
              />
            ))}
          </span>
          <span className="text-6xl relative">🏆</span>
        </div>

        <header className="text-center flex flex-col gap-1">
          <h2 className="font-display text-2xl leading-tight">
            {t("ratingTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("ratingSubtitle")}
          </p>
        </header>

        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= stars;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                aria-label={`${n} ${n === 1 ? t("star") : t("stars")}`}
                className={`size-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                  filled
                    ? "bg-[var(--stage-yellow)] text-[#1a0b3d] shadow-md shadow-[var(--stage-yellow)]/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8z" />
                </svg>
              </button>
            );
          })}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("commentLabel")}
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={400}
            rows={3}
            placeholder={t("commentPlaceholder")}
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent resize-none"
          />
        </label>

        {error && (
          <p className="text-xs text-red-600 border border-red-600/30 rounded-lg px-3 py-2 bg-red-600/5">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 h-11 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {t("ratingLater")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="flex-1 h-11 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? t("rating") : t("ratingSubmit")}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          {t("reputationReminder")}
        </p>
      </div>
    </div>,
    document.body,
  );
}
