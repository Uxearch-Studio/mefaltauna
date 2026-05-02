# mefaltauna — agent instructions

## This is NOT the Next.js you know

This project uses **Next.js 16**, which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 changes to be aware of:
- `middleware.ts` is now `proxy.ts` (same functionality, new name).
- `params` and `searchParams` are async — always `await` them.
- Tailwind v4 uses `@theme inline` in CSS, not a JS config file.

## Project context

- **Product**: PWA para intercambio y venta de láminas del álbum Panini Mundial 2026.
- **Business model**: paid posting tiers (5 láminas = 3.000 COP, 20 = 10.000 COP, ilimitadas = 50.000 COP). Payments via Wompi.
- **Audience**: Spanish-speaking (LATAM-first), with full English locale parity.
- **Stack**: Next 16 (App Router) + TypeScript strict + Tailwind v4 + next-intl + Supabase + Wompi (later) + Vercel.

## Conventions

- Locales: `es` (default) and `en`. All copy goes through `next-intl` — no hardcoded strings in JSX.
- Imports use `@/*` alias mapped to `src/*`.
- Server Components by default. Mark `"use client"` only when strictly needed.
- All forms validated with Zod. Same schema runs client and server.
- Database access only through Supabase clients in `src/lib/supabase/`. Never expose service-role key client-side.
- Footer credit must remain on every public page: "Creado por uxearch.com & Javier Mora — UX Product Designer" + slogan.

## Design system

Vintage / WC98 / foosball aesthetic. Chunky condensed display type, halftone textures, troquel-style sticker borders. Light + dark themes, both B&W base with a swappable accent color (default: Panini red `#d62828`).
