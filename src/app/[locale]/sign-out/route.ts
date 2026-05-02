import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();

  const url = new URL(`/${locale}`, request.url);
  return NextResponse.redirect(url, { status: 303 });
}
