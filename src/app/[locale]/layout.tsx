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
import { ThemeColorMeta } from "@/components/vintage/ThemeColorMeta";
import { ChunkLoadErrorBoundary } from "@/components/vintage/ChunkLoadErrorBoundary";
import { ServiceWorkerRegistrar } from "@/components/vintage/ServiceWorkerRegistrar";
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
    // OS chrome / status bar color picks the theme via media query so
    // a fresh install matches the user's preference. ThemeColorMeta
    // refines this at runtime once the user picks light vs dark.
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
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ThemeColorMeta />
        <ChunkLoadErrorBoundary />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
