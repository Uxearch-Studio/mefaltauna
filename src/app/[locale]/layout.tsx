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
import { ServiceWorkerRegistrar } from "@/components/vintage/ServiceWorkerRegistrar";
import { ThemeColorMeta } from "@/components/vintage/ThemeColorMeta";
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
    metadataBase: new URL("https://mefaltauna.vercel.app"),
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
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ThemeColorMeta />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
