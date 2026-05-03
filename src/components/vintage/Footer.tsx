import { useTranslations } from "next-intl";
import { LogoMark } from "./Logo";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/mefaltauna",
    Icon: InstagramIcon,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@mefaltauna",
    Icon: TikTokIcon,
  },
  {
    name: "X",
    href: "https://x.com/mefaltauna",
    Icon: XIcon,
  },
];

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--stage-bg)] text-white overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-1/4 left-1/2 -translate-x-1/2 size-[60vmax] rounded-full opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--stage-purple-1) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 flex flex-col items-center text-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <LogoMark className="size-12 text-white" />
          <span className="font-display text-3xl md:text-4xl tracking-tight lowercase">
            mefaltauna
          </span>
        </div>

        <p
          className="font-display whitespace-nowrap"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.75rem)" }}
        >
          Mundial 2026 · Hecho en Colombia
        </p>

        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="size-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-[var(--stage-yellow)] hover:text-[var(--stage-bg)] hover:border-transparent transition-colors"
            >
              <Icon className="size-5" />
            </a>
          ))}
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-2 mt-4 pt-8 border-t border-white/10">
          <p className="text-xs text-white/50 leading-relaxed">
            {t("tagline")}
          </p>
          <p className="text-xs text-white/40">
            {t("credit")}{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[var(--stage-yellow)] transition-colors"
            >
              uxearch.com
            </a>{" "}
            · Javier Mora
          </p>
          <p className="text-[10px] text-white/30 mt-2">© {year}</p>
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
