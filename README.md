# mefaltauna

PWA para intercambio y venta de láminas del álbum **Panini Mundial 2026**.

> "¿Cuánto te falta?" — encuentra a quien tenga las que te faltan, intercambia o compra.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript strict
- Tailwind v4
- [next-intl](https://next-intl-docs.vercel.app) — ES (default) / EN
- [Supabase](https://supabase.com) — Auth + Postgres + Storage + Realtime
- [Wompi](https://wompi.com.co) — pagos (Colombia, fase 2)
- Vercel — hosting

## Desarrollo

```bash
pnpm install
cp .env.local.example .env.local   # llenar con valores reales de Supabase
pnpm dev                            # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm build
```

## Setup de Supabase

1. Crea un proyecto en [app.supabase.com](https://app.supabase.com).
2. Copia `Project URL` y `anon` key a `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Aplica las migraciones SQL en orden desde el SQL editor de Supabase:
   - `supabase/migrations/0001_profiles.sql` — tabla `profiles` con RLS
     y trigger que la pobla automáticamente cuando un usuario se
     registra.
4. En **Authentication → URL Configuration**, agrega
   `http://localhost:3000/auth/callback` como redirect URL durante
   desarrollo (y la URL de producción cuando deployes).
5. (Opcional) En **Authentication → Email Templates**, personaliza el
   correo del magic link para que diga "mefaltauna".

## Estructura

```
src/
├── app/[locale]/        # rutas localizadas
├── components/
│   ├── ui/              # primitives
│   └── vintage/         # componentes con identidad de marca
├── i18n/                # config next-intl
├── lib/                 # utilidades, supabase clients
├── messages/            # es.json | en.json
└── proxy.ts             # antes "middleware" — Next 16 lo renombra
supabase/
├── migrations/          # SQL versionado
└── seed.sql             # catálogo Panini 2026
```

## Roadmap

- [x] Fase 0 — bootstrap, i18n, sistema de diseño base
- [ ] Fase 1 — landing pública pulida
- [ ] Fase 2 — auth + perfil de usuario
- [ ] Fase 3 — catálogo Panini 2026 (sourcing + seed)
- [ ] Fase 4 — listings + paywall
- [ ] Fase 5 — matching + chat realtime
- [ ] Fase 6 — pagos Wompi
- [ ] Fase 7 — PWA polish + Lighthouse 95+
- [ ] Fase 8 — launch público

## Crédito

Creado por [uxearch.com](https://uxearch.com) & **Javier Mora** — UX Product Designer.
