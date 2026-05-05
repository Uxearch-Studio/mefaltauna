-- Bring the album in line with the actual Panini Mundial 2026 set:
-- - Each national team gets 1 escudo + 1 foto grupal + 18 jugadores
--   (was 1 escudo + 12 jugadores).
-- - Stadiums grow from 12 to 16 venues.
--
-- This migration only declares the new enum value. Postgres refuses
-- to use a freshly-added enum value within the same transaction that
-- created it, so the actual INSERTs that reference 'team_photo' live
-- in migration 0019.

alter type public.sticker_type add value if not exists 'team_photo';
