import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Bowlby_One,
  Permanent_Marker,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { themeBootScript } from "@/components/vintage/ThemeSwitcher";
// ServiceWorkerRegistrar removed — the previous SW shipped with a
// fetch-intercepting passthrough that left some clients wedged after
// chunk-rotating deploys. /sw.js now self-unregisters and we don't
// re-register it from the client until that decision is revisited.
import { ThemeColorMeta } from "@/components/vintage/ThemeColorMeta";
import { BootSplash } from "@/components/vintage/BootSplash";
import { ChunkLoadErrorBoundary } from "@/components/vintage/ChunkLoadErrorBoundary";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const bowlby = Bowlby_One({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://mefaltauna.com"),
    manifest: "/manifest.webmanifest",
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "mefaltauna",
    },
    // Two static fallbacks for the OS chrome color so a fresh install
    // matches the expected theme even before our boot script runs.
    // The ThemeColorMeta client component refines this at runtime to
    // reflect whatever the user actually chose.
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
      { media: "(prefers-color-scheme: dark)", color: "#0d0521" },
    ],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrains.variable} ${bowlby.variable} ${marker.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {/* Emergency cleanup — runs on every page load until removed.
            Unregisters every service worker and wipes every cache so
            clients that got wedged on a previous deploy's intercepting
            SW recover within one navigation. Safe to leave in: doesn't
            block render (fire-and-forget promises) and is no-op once
            no SW / no caches exist. Will be removed in a follow-up
            once the wedge wave has cleared. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(rs){
        rs.forEach(function(r){ r.unregister(); });
      }).catch(function(){});
    }
    if (typeof caches !== 'undefined') {
      caches.keys().then(function(keys){
        keys.forEach(function(k){ caches.delete(k); });
      }).catch(function(){});
    }
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      {/* Inline `style` on body locks the brand violet as the very
          first paint surface, so we never flash white between the OS
          PWA splash and our CSS loading. globals.css overrides this
          for the actual theme tokens once it's parsed. */}
      <body
        className="min-h-full bg-background text-foreground font-sans"
        style={{ backgroundColor: "#1a0b3d" }}
      >
        <BootSplash />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ThemeColorMeta />
        <ChunkLoadErrorBoundary />
      </body>
    </html>
  );
}
