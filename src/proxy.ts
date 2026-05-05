import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { refreshSupabaseSession } from "./lib/supabase/proxy";

const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  await refreshSupabaseSession(request, response);
  return response;
}

export const config = {
  // /reset is excluded so the next-intl middleware doesn't rewrite
  // it to /es/reset — the reset route is a self-contained cache /
  // service-worker wiper that has to live at the literal path the
  // user types into their address bar.
  matcher: ["/((?!api|_next|_vercel|auth/callback|reset|.*\\..*).*)"],
};
