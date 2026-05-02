-- Phase 3.5 — extend listings with what the publisher wants in exchange.
-- A trade can target a specific sticker, a whole team, or be open-ended
-- (no wants set). For sale-only listings, wants_* stay null.

alter table public.listings
  add column if not exists wants_sticker_id integer
    references public.sticker_catalog(id) on delete set null;

alter table public.listings
  add column if not exists wants_team_code text;

create index if not exists listings_wants_sticker_idx
  on public.listings (wants_sticker_id) where wants_sticker_id is not null;

create index if not exists listings_wants_team_idx
  on public.listings (wants_team_code) where wants_team_code is not null;
