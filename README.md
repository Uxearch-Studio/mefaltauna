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
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm build
```

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
