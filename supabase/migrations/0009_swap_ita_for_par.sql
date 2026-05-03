-- Italy did not qualify for the 2026 World Cup. Replace ITA in the
-- sticker catalog with Paraguay (PAR) so the album reflects the actual
-- 24 nations seeded in the preview. Inventory rows referencing the old
-- ITA stickers are dropped — the album was preview-data only and no
-- listings should reference these in production yet.

-- 1) Remove any inventory and listings referencing ITA stickers.
delete from public.inventory
where sticker_id in (
  select id from public.sticker_catalog where team_code = 'ITA'
);

delete from public.listings
where sticker_id in (
  select id from public.sticker_catalog where team_code = 'ITA'
)
or wants_sticker_id in (
  select id from public.sticker_catalog where team_code = 'ITA'
);

-- 2) Drop the ITA badge + 12 player stickers.
delete from public.sticker_catalog where team_code = 'ITA';

-- 3) Seed Paraguay (PAR) on the same album page Italy used (page 36).
do $$
declare
  i int;
  par_page int := 36;
begin
  insert into public.sticker_catalog (code, type, team_code, name, album_page)
  values (
    'PAR-BADGE',
    'badge'::public.sticker_type,
    'PAR',
    'Escudo PAR',
    par_page
  )
  on conflict (code) do nothing;

  for i in 1..12 loop
    insert into public.sticker_catalog (code, type, team_code, number, name, album_page)
    values (
      'PAR-' || lpad(i::text, 2, '0'),
      'player'::public.sticker_type,
      'PAR',
      i,
      'Jugador ' || i,
      par_page
    )
    on conflict (code) do nothing;
  end loop;
end $$;
