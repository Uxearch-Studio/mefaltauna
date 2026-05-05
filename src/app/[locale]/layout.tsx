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
        {/* Emergency cleanup — runs on every page load.
            Per spec, unregister() resolves immediately but the SW
            stays active over current clients until they navigate
            away. So a wedged tab keeps hitting the old SW's broken
            fetch interception even after unregister. We solve that
            by force-reloading once after a successful unregister,
            guarded by a sessionStorage flag so we never loop. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    if (sessionStorage.getItem('mfu:sw-purged')) return;
    if (!('serviceWorker' in navigator)) {
      sessionStorage.setItem('mfu:sw-purged', '1');
      return;
    }
    navigator.serviceWorker.getRegistrations().then(function(rs){
      if (!rs || rs.length === 0) {
        sessionStorage.setItem('mfu:sw-purged', '1');
        return;
      }
      // Found a registered SW. Unregister, wipe caches, then force
      // a hard reload so this tab stops being controlled by it.
      Promise.all(rs.map(function(r){ return r.unregister(); }))
        .then(function(){
          if (typeof caches === 'undefined') return [];
          return caches.keys().then(function(keys){
            return Promise.all(keys.map(function(k){ return caches.delete(k); }));
          });
        })
        .catch(function(){})
        .then(function(){
          sessionStorage.setItem('mfu:sw-purged', '1');
          // Hard reload — bypasses the still-controlling SW because
          // the new request goes through the fresh registration state.
          window.location.reload();
        });
    }).catch(function(){
      sessionStorage.setItem('mfu:sw-purged', '1');
    });
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
