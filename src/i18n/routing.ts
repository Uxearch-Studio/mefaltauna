import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  // Default to Spanish always — never auto-pick English from the
  // browser's Accept-Language header.
  localeDetection: false,
});
