-- Multi-listing trades.
--
-- Until now a trade was tied to a single listing through
-- public.trades.listing_id. In the field a seller often has multiple
-- stickers a single buyer wants and they meet up to swap them all in
-- one go — yet our flow forced them to run a fresh QR + rating cycle
-- per sticker. That inflates the rating tally artificially (one
-- physical encounter generates N reputation events) and is just bad
-- UX for participants.
--
-- This migration:
--   1. Introduces a `trade_items` join table so a trade can carry N
--      listings.
--   2. Backfills it from existing trades.listing_id for continuity.
--   3. Replaces start_trade to accept p_listing_ids uuid[]; the items
--      table receives one row per listing. trades.listing_id is kept
--      for backwards compat — it points at the first listing only.
--   4. Updates confirm_trade to mark every listing in trade_items as
--      sold (was: only the trade's single listing_id).
--
-- Both RPCs keep the same return shape so existing client code reads
-- the response identically.

-- ────────────────────────────────────────────────────────────
-- 1) trade_items join table
-- ────────────────────────────────────────────────────────────
create table if not exists public.trade_items (
  trade_id   uuid not null references public.trades(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  primary key (trade_id, listing_id)
);

alter table public.trade_items enable row level security;

drop policy if exists "trade_items_select_party" on public.trade_items;
create policy "trade_items_select_party"
  on public.trade_items for select
  using (
    exists (
      select 1 from public.trades t
      where t.id = trade_items.trade_id
        and (t.seller_id = auth.uid() or t.buyer_id = auth.uid())
    )
  );

-- ────────────────────────────────────────────────────────────
-- 2) Backfill existing trades (one item each)
-- ────────────────────────────────────────────────────────────
insert into public.trade_items (trade_id, listing_id)
  select id, listing_id
    from public.trades
   where listing_id is not null
on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- 3) start_trade — array variant
-- ────────────────────────────────────────────────────────────
-- Drop the old single-listing signature so callers don't accidentally
-- pick up the stale shape.
drop function if exists public.start_trade(uuid, uuid);

create or replace function public.start_trade(
  p_conversation_id uuid,
  p_listing_ids     uuid[]
)
returns table (trade_id uuid, qr_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv public.conversations%rowtype;
  v_buyer    uuid;
  v_token    text;
  v_trade_id uuid;
  v_qr_token text;
  v_listing  public.listings%rowtype;
  lid        uuid;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;

  if p_listing_ids is null or array_length(p_listing_ids, 1) is null then
    raise exception 'no_listings';
  end if;

  select * into conv from public.conversations where id = p_conversation_id;
  if not found then
    raise exception 'conversation_not_found';
  end if;
  if uid <> conv.user_a and uid <> conv.user_b then
    raise exception 'not_participant';
  end if;

  v_buyer := case when conv.user_a = uid then conv.user_b else conv.user_a end;

  -- All passed listings must belong to the caller (the seller).
  foreach lid in array p_listing_ids loop
    select * into v_listing from public.listings where id = lid;
    if not found then
      raise exception 'listing_not_found';
    end if;
    if v_listing.user_id <> uid then
      raise exception 'caller_not_seller';
    end if;
  end loop;

  -- Reuse a still-pending trade for this (conv, seller). If the seller
  -- changed which items they're settling, replace the items list.
  select t.id, t.qr_token
    into v_trade_id, v_qr_token
    from public.trades t
   where t.conversation_id = p_conversation_id
     and t.seller_id = uid
     and t.status = 'pending'
   order by t.created_at desc
   limit 1;

  if v_trade_id is not null then
    delete from public.trade_items where trade_id = v_trade_id;
    insert into public.trade_items (trade_id, listing_id)
      select v_trade_id, unnest(p_listing_ids);
    update public.trades
       set listing_id = p_listing_ids[1]
     where id = v_trade_id;
  else
    v_token := substr(
      replace(gen_random_uuid()::text, '-', '') ||
      replace(gen_random_uuid()::text, '-', ''),
      1, 48
    );

    insert into public.trades (
      conversation_id, seller_id, buyer_id, listing_id, qr_token
    ) values (
      p_conversation_id, uid, v_buyer, p_listing_ids[1], v_token
    )
    returning id, qr_token into v_trade_id, v_qr_token;

    insert into public.trade_items (trade_id, listing_id)
      select v_trade_id, unnest(p_listing_ids);
  end if;

  trade_id := v_trade_id;
  qr_token := v_qr_token;
  return next;
end;
$$;

revoke all on function public.start_trade(uuid, uuid[]) from public;
grant execute on function public.start_trade(uuid, uuid[]) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 4) confirm_trade — settle every listing in the trade
-- ────────────────────────────────────────────────────────────
create or replace function public.confirm_trade(p_token text)
returns table (
  trade_id        uuid,
  conversation_id uuid,
  seller_id       uuid,
  buyer_id        uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.trades%rowtype;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;

  select * into rec from public.trades where qr_token = p_token;
  if not found then
    raise exception 'token_not_found';
  end if;
  if rec.buyer_id <> uid then
    raise exception 'not_buyer';
  end if;
  if rec.status <> 'pending' then
    raise exception 'already_settled';
  end if;

  update public.trades
     set status = 'completed', completed_at = now()
   where id = rec.id;

  -- Mark every listing bundled into this trade as sold. Limited to
  -- listings still owned by the seller and still active so we don't
  -- accidentally clobber unrelated state.
  update public.listings
     set status = 'sold'
   where id in (
     select listing_id from public.trade_items where trade_id = rec.id
   )
     and user_id = rec.seller_id
     and status = 'active';

  trade_id        := rec.id;
  conversation_id := rec.conversation_id;
  seller_id       := rec.seller_id;
  buyer_id        := rec.buyer_id;
  return next;
end;
$$;
