import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Magic-link / OAuth callback. Supabase sends users here with a `code`
 * query param after they click the email link. We exchange the code
 * for a session, then redirect to the `next` destination (or home).
 *
 * IMPORTANT: this lives outside the [locale] segment because it's a
 * system route — proxy.ts excludes it from i18n routing.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Anything went wrong — bounce to the Spanish sign-in with an error.
  return NextResponse.redirect(`${origin}/es/sign-in?error=callback_failed`);
}
