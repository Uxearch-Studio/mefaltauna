import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { PixelTrophy } from "@/components/vintage/PixelArt";
import { Link } from "@/i18n/navigation";

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkEmail");

  return (
    <>
      <Header />
      <main>
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16 scanlines">
          <div className="w-full max-w-md flex flex-col items-center gap-6 text-center border-2 border-border bg-background p-8 border-sticker">
            <PixelTrophy className="size-16 text-accent" />

            <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
              {t("kicker")}
            </p>

            <h1 className="font-display text-3xl md:text-4xl leading-[0.9]">
              {t("title")}
            </h1>

            <p className="text-sm text-foreground/70 leading-relaxed">
              {t("body")}
            </p>

            {email && (
              <p className="font-mono text-sm break-all px-3 py-2 bg-muted border-2 border-border w-full">
                {email}
              </p>
            )}

            <p className="text-xs font-mono text-muted-foreground">
              {t("hint")}
            </p>

            <Link
              href="/sign-in"
              className="font-pixel text-[10px] uppercase text-foreground hover:text-accent transition-colors"
            >
              {t("back")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
