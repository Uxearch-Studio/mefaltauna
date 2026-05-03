import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { BottomNav } from "@/components/vintage/BottomNav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchUnreadTotal } from "@/lib/db";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser({ locale, next: `/${locale}/app/feed` });

  const supabase = await createSupabaseServerClient();
  const unread = supabase ? await fetchUnreadTotal(supabase, user.id) : 0;

  return (
    <>
      <main className="pb-28 min-h-screen">{children}</main>
      <BottomNav unreadCount={unread} />
    </>
  );
}
