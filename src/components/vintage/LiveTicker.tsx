import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchActiveListings } from "@/lib/db";

const SAMPLE_ENTRIES = [
  "ARG-10 PUESTA A VENTA · $4.000",
  "COL-07 EN CAMBIO POR BRA-09",
  "MEX-12 EN VENTA · $3.500",
  "ESP-04 BUSCA POR FRA-08",
  "BRA-11 EN VENTA · $5.000",
  "COL-04 OFERTA POR ARG-19",
];

const COP = new Intl.NumberFormat("es-CO");

export async function LiveTicker() {
  const supabase = await createSupabaseServerClient();
  const listings = supabase ? await fetchActiveListings(supabase, 18) : [];

  const realEntries = listings.map((l) => {
    const priceLabel =
      l.price_cop !== null ? `· $${COP.format(l.price_cop)}` : "";
    const action =
      l.type === "sale"
        ? "EN VENTA"
        : l.type === "trade"
          ? "EN CAMBIO"
          : "VENTA / CAMBIO";
    return `${l.sticker.code} ${action} ${priceLabel}`.trim();
  });

  const entries = realEntries.length >= 4 ? realEntries : SAMPLE_ENTRIES;
  // Duplicate so the marquee can loop seamlessly with translateX(-50%).
  const stream = [...entries, ...entries];

  return (
    <div
      className="relative w-full overflow-hidden border-y border-white/10 bg-black/40"
      aria-label="Live ticker"
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="flex items-center gap-1.5 shrink-0 z-10 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
          <span className="size-1.5 rounded-full bg-white animate-live-pulse" />
          LIVE
        </span>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex items-center gap-8 whitespace-nowrap animate-marquee"
            style={{ width: "max-content" }}
          >
            {stream.map((text, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold tracking-wider uppercase text-white/80"
              >
                <span className="text-[#f7c948]">▸</span> {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
