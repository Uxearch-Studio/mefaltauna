import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { PixelBall } from "@/components/vintage/PixelArt";
import { SignInForm } from "./SignInForm";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("signIn");

  return (
    <>
      <Header />
      <main>
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16 scanlines">
          <div className="w-full max-w-md flex flex-col gap-8 border-2 border-border bg-background p-8 border-sticker">
            <div className="flex items-center gap-3">
              <PixelBall className="size-8 text-accent" />
              <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
                {t("kicker")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-display text-4xl md:text-5xl leading-[0.9]">
                {t("title")}
              </h1>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            <SignInForm locale={locale} next={next} initialError={error} />

            <p className="text-xs font-mono text-muted-foreground text-center">
              {t("disclaimer")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
