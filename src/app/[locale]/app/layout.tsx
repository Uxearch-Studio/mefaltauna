import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { BottomNav } from "@/components/vintage/BottomNav";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser({ locale, next: `/${locale}/app/feed` });

  return (
    <>
      <main className="pb-28 min-h-screen">{children}</main>
      <BottomNav />
    </>
  );
}
