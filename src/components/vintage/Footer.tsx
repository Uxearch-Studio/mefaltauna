import { useTranslations } from "next-intl";
import { LogoMark } from "./Logo";

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com/mefaltauna", Icon: InstagramIcon },
  { name: "TikTok",    href: "https://tiktok.com/@mefaltauna",   Icon: TikTokIcon },
  { name: "X",         href: "https://x.com/mefaltauna",         Icon: XIcon },
];

const MARQUEE_ITEMS = [
  "MEFALTAUNA",
  "MUNDIAL 2026",
  "HECHO EN COLOMBIA",
  "★",
];

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  const stream = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <footer className="bg-[var(--stage-bg)] text-white">
      {/* Top marquee — broadcast-style scrolling brand strip */}
      <div className="border-y border-white/10 overflow-hidden bg-black/30">
        <div className="flex items-center gap-10 py-3 whitespace-nowrap animate-marquee" style={{ width: "max-content" }}>
          {stream.map((text, i) => (
            <span
              key={i}
              className="font-display text-xl md:text-2xl tracking-tight uppercase text-[var(--stage-yellow)]"
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Main row — logo on the left, socials on the right */}
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <LogoMark className="size-8 text-white" />
          <span className="font-display text-xl tracking-tight lowercase">
            mefaltauna
          </span>
        </a>

        <div className="flex items-center gap-2">
          {SOCIALS.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="size-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-[var(--stage-yellow)] hover:text-[var(--stage-bg)] hover:border-transparent transition-colors"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Hairline + tiny credit */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-white/50 text-center sm:text-left">
          <p>
            Creado por{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-[var(--stage-yellow)] transition-colors"
            >
              uxearch
            </a>
            {" · "}
            <span>Javier Mora</span>
            {" · "}
            <span className="text-white/60">Diseñamos Apps, Softwares o websites</span>
          </p>
          <p className="text-white/30">© {year}</p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3.1a8.5 8.5 0 0 1-4.5-1.4v6.8a6 6 0 1 1-6-6 6 6 0 0 1 1 .1v3.2a3 3 0 1 0 2 2.7V3z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
