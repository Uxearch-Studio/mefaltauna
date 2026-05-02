-- mefaltauna — preview seed for the Panini Mundial 2026 album.
-- 12 group cards + 24 team badges + 24 × 12 player stickers + 12 stadium cards
-- = 336 stickers total. Replace player names with the real Panini list when
-- it's available (this migration is idempotent thanks to ON CONFLICT).

-- ────────────────────────────────────────────────────────────
-- Group cards (one per group A–L)
-- ────────────────────────────────────────────────────────────
insert into public.sticker_catalog (code, type, name, album_page)
select 'GRP-' || g, 'group'::public.sticker_type, 'Grupo ' || g, idx
from (values
  ('A',  1), ('B',  2), ('C',  3), ('D',  4), ('E',  5), ('F',  6),
  ('G',  7), ('H',  8), ('I',  9), ('J', 10), ('K', 11), ('L', 12)
) as t(g, idx)
on conflict (code) do nothing;

-- ────────────────────────────────────────────────────────────
-- 24 known qualified teams: 1 badge + 12 player stickers each
-- ────────────────────────────────────────────────────────────
do $$
declare
  rec record;
  i int;
  page_num int := 13;
begin
  for rec in select * from (values
    ('MEX'), ('BEL'),
    ('CAN'), ('CRO'),
    ('ARG'), ('URU'),
    ('USA'), ('COL'),
    ('BRA'), ('JPN'),
    ('FRA'), ('KOR'),
    ('ESP'), ('AUS'),
    ('GER'), ('SEN'),
    ('ENG'), ('MAR'),
    ('POR'), ('ECU'),
    ('NED'), ('SUI'),
    ('ITA'), ('DEN')
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

-- ────────────────────────────────────────────────────────────
-- Stadium cards (12 representative venues across the 3 hosts)
-- ────────────────────────────────────────────────────────────
insert into public.sticker_catalog (code, type, name, album_page)
select 'STA-' || s, 'stadium'::public.sticker_type, 'Estadio ' || label, 37 + idx - 1
from (values
  ('AZTECA',   'Azteca',                1),
  ('METLIFE',  'MetLife',               2),
  ('SOFI',     'SoFi',                  3),
  ('BMOFIELD', 'BMO Field',             4),
  ('MERCEDES', 'Mercedes-Benz',         5),
  ('HARDROCK', 'Hard Rock',             6),
  ('BCPLACE',  'BC Place',              7),
  ('GILLETTE', 'Gillette',              8),
  ('NRG',      'NRG',                   9),
  ('LINCOLN',  'Lincoln Financial',    10),
  ('AKRON',    'Akron',                11),
  ('BBVA',     'BBVA',                 12)
) as t(s, label, idx)
on conflict (code) do nothing;
