-- Companion to migration 0018. Postgres requires a fresh enum value
-- to be committed before another statement can use it, so the actual
-- inserts that reference 'team_photo' run here, one migration later.

-- ────────────────────────────────────────────────────────────
-- 1) team_photo + 6 extra player stickers (numbers 13..18) for every
--    team that already has a badge.
-- ────────────────────────────────────────────────────────────
do $$
declare
  rec record;
  i int;
begin
  for rec in
    select distinct team_code, album_page
      from public.sticker_catalog
     where type = 'badge'::public.sticker_type
       and team_code is not null
  loop
    -- Foto grupal — one per team, slotted right after the badge in
    -- the visual grid.
    insert into public.sticker_catalog (
      code, type, team_code, name, album_page
    ) values (
      rec.team_code || '-PHOTO',
      'team_photo'::public.sticker_type,
      rec.team_code,
      'Foto grupal ' || rec.team_code,
      rec.album_page
    )
    on conflict (code) do nothing;

    -- Players 13..18 to round out a full 18-man squad.
    for i in 13..18 loop
      insert into public.sticker_catalog (
        code, type, team_code, number, name, album_page
      ) values (
        rec.team_code || '-' || lpad(i::text, 2, '0'),
        'player'::public.sticker_type,
        rec.team_code,
        i,
        'Jugador ' || i,
        rec.album_page
      )
      on conflict (code) do nothing;
    end loop;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────
-- 2) Four additional stadium cards to reach the official 16 venues.
-- ────────────────────────────────────────────────────────────
insert into public.sticker_catalog (code, type, name, album_page)
select 'STA-' || s, 'stadium'::public.sticker_type, 'Estadio ' || label, page
from (values
  ('ATT',     'AT&T',           45),  -- Arlington, TX
  ('ARROW',   'Arrowhead',      46),  -- Kansas City, MO
  ('LEVIS',   'Levi''s',        47),  -- Santa Clara, CA
  ('LUMEN',   'Lumen Field',    48)   -- Seattle, WA
) as t(s, label, page)
on conflict (code) do nothing;
