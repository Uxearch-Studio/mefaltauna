-- Special / "title-page" stickers from the official Panini Mundial
-- 2026 album: trophy, tournament logo, mascots, official ball, host
-- emblems. These ride on the existing 'special' enum value (already
-- in sticker_type since the original schema), so no enum mutation
-- needed — straight inserts.
--
-- Album pages 90+ keep them clear of the team / stadium ranges so
-- catalog ordering stays predictable. AlbumGrid bumps them to the
-- top of the visual list separately based on type.

insert into public.sticker_catalog (code, type, name, album_page) values
  ('SP-TROPHY', 'special', 'Copa del Mundo',          90),
  ('SP-LOGO',   'special', 'Logo Mundial 2026',       91),
  ('SP-BALL',   'special', 'Balón oficial',           92),
  ('SP-MAPLE',  'special', 'Maple — mascota Canadá',  93),
  ('SP-ZAYU',   'special', 'Zayu — mascota México',   94),
  ('SP-CLUTCH', 'special', 'Clutch — mascota EE.UU.', 95),
  ('SP-HOST-US','special', 'Sede Estados Unidos',     96),
  ('SP-HOST-MX','special', 'Sede México',             97),
  ('SP-HOST-CA','special', 'Sede Canadá',             98)
on conflict (code) do nothing;
