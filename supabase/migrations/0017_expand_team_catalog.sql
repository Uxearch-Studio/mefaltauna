-- World Cup 2026 expanded the field from 32 to 48 teams. The initial
-- seed (migration 0003) only covered 24 nations, plus migration 0009
-- swapped Italy for Paraguay. This pass adds the 25 remaining teams
-- the user flagged as missing from their album.
--
-- Each team gets one badge sticker + 12 player stickers, identical
-- shape to migration 0003. Idempotent via ON CONFLICT, so re-running
-- is safe.

do $$
declare
  rec record;
  i int;
  page_num int := 49; -- Continues after the original 24 teams (pages 13-36)
                      -- and the 12 stadium pages (37-48). Album view sorts
                      -- alphabetically so the page numbers only matter for
                      -- uniqueness within sticker_catalog.
begin
  for rec in select * from (values
    ('RSA'),  -- South Africa
    ('CZE'),  -- Czech Republic
    ('BIH'),  -- Bosnia and Herzegovina
    ('QAT'),  -- Qatar
    ('HAI'),  -- Haiti
    ('SCO'),  -- Scotland
    ('TUR'),  -- Turkey
    ('CUW'),  -- Curaçao
    ('CIV'),  -- Cote d'Ivoire
    ('SWE'),  -- Sweden
    ('TUN'),  -- Tunisia
    ('EGY'),  -- Egypt
    ('IRN'),  -- Iran
    ('NZL'),  -- New Zealand
    ('CPV'),  -- Cape Verde
    ('KSA'),  -- Saudi Arabia
    ('IRQ'),  -- Iraq
    ('NOR'),  -- Norway
    ('ALG'),  -- Algeria
    ('AUT'),  -- Austria
    ('JOR'),  -- Jordan
    ('COD'),  -- DR Congo
    ('UZB'),  -- Uzbekistan
    ('GHA'),  -- Ghana
    ('PAN')   -- Panama
  ) as t(team_code) loop
    -- Team badge
    insert into public.sticker_catalog (code, type, team_code, name, album_page)
    values (
      rec.team_code || '-BADGE',
      'badge'::public.sticker_type,
      rec.team_code,
      'Escudo ' || rec.team_code,
      page_num
    )
    on conflict (code) do nothing;

    -- 12 player stickers
    for i in 1..12 loop
      insert into public.sticker_catalog (code, type, team_code, number, name, album_page)
      values (
        rec.team_code || '-' || lpad(i::text, 2, '0'),
        'player'::public.sticker_type,
        rec.team_code,
        i,
        'Jugador ' || i,
        page_num
      )
      on conflict (code) do nothing;
    end loop;

    page_num := page_num + 1;
  end loop;
end $$;
