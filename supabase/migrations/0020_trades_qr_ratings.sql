-- QR-based trade confirmation flow with mutual rating.
--
-- The seller in a chat can flip a deal into "Compra acordada" mode.
-- That creates a `trades` row with a unique random token, which the
-- chat renders as a QR for the seller only. The buyer scans the QR
-- in person at the moment of exchange — scanning hits an action
-- that flips the trade to COMPLETED, increments both users'
-- reputation, and unlocks the rating modal for both sides.
--
-- Rating uses 1–5 stars and an optional comment. Each user rates
-- the OTHER once per trade. The aggregate rating is stored on
-- `profiles.reputation` (running average × 10 so we don't need
-- decimals — UI divides by 10).
--
-- Reputation in the user's words: "aquí tu reputación lo es todo".
-- That's why ratings update profile.reputation immediately on
-- submission rather than waiting for both sides to rate.

-- ────────────────────────────────────────────────────────────
-- 1) trades table
-- ────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  seller_id       uuid not null references auth.users(id) on delete cascade,
  buyer_id        uuid not null references auth.users(id) on delete cascade,
  listing_id      uuid references public.listings(id) on delete set null,
  -- Random token the QR encodes. Only the seller's client renders
  -- it; once scanned + confirmed it can't be replayed.
  qr_token        text not null unique,
  status          text not null default 'pending'
                    check (status in ('pending', 'completed', 'cancelled', 'expired')),
  created_at      timestamptz not null default now(),
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  check (seller_id <> buyer_id)
);

create index if not exists trades_conversation_id_idx
  on public.trades (conversation_id, created_at desc);
create index if not exists trades_seller_idx on public.trades (seller_id);
create index if not exists trades_buyer_idx  on public.trades (buyer_id);

alter table public.trades enable row level security;

-- Buyers and sellers can both see their own trades.
drop policy if exists "trades_select_party" on public.trades;
create policy "trades_select_party"
  on public.trades for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

-- Inserts and updates go through SECURITY DEFINER RPCs below; no
-- direct writes from clients.

-- ────────────────────────────────────────────────────────────
-- 2) trade_ratings table — one row per (trade, rater)
-- ────────────────────────────────────────────────────────────
create table if not exists public.trade_ratings (
  id          uuid primary key default gen_random_uuid(),
  trade_id    uuid not null references public.trades(id) on delete cascade,
  rater_id    uuid not null references auth.users(id) on delete cascade,
  rated_id    uuid not null references auth.users(id) on delete cascade,
  stars       int not null check (stars between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (trade_id, rater_id),
  check (rater_id <> rated_id)
);

create index if not exists trade_ratings_rated_idx
  on public.trade_ratings (rated_id, created_at desc);

alter table public.trade_ratings enable row level security;

-- Anyone can read ratings about THEM (so the FUT card can show the
-- list). The rater's identity stays public — it's a marketplace
-- credibility signal — but that policy can be tightened later.
drop policy if exists "ratings_select_visible" on public.trade_ratings;
create policy "ratings_select_visible"
  on public.trade_ratings for select
  using (true);

-- ────────────────────────────────────────────────────────────
-- 3) Cached aggregate columns on profiles
-- profiles.reputation already exists; we expose two more so the FUT
-- card and the feed badges read fast without a count(*) every time.
-- ────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists rating_count int not null default 0,
  add column if not exists rating_sum   int not null default 0;

-- ────────────────────────────────────────────────────────────
-- 4) RPC: start_trade — seller flips a chat into "Compra acordada"
-- ────────────────────────────────────────────────────────────
create or replace function public.start_trade(
  p_conversation_id uuid,
  p_listing_id      uuid
)
returns table (trade_id uuid, qr_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv public.conversations%rowtype;
  buyer uuid;
  token text;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;

  select * into conv from public.conversations where id = p_conversation_id;
  if not found then
    raise exception 'conversation_not_found';
  end if;
  if uid <> conv.user_a and uid <> conv.user_b then
    raise exception 'not_participant';
  end if;

  -- The seller is the user who STARTED the chat as the listing owner.
  -- Whoever is NOT the seller is the buyer. We figure that out from
  -- listings.user_id when a listing_id is passed; otherwise the seller
  -- is whoever called start_trade (the convention in our app).
  if p_listing_id is not null then
    select user_id into buyer from public.listings where id = p_listing_id;
    -- Listing owner = seller; the OTHER side of the conv = buyer.
    if buyer is null then
      raise exception 'listing_not_found';
    end if;
    if buyer = uid then
      buyer := case when conv.user_a = uid then conv.user_b else conv.user_a end;
    else
      raise exception 'caller_not_seller';
    end if;
  else
    buyer := case when conv.user_a = uid then conv.user_b else conv.user_a end;
  end if;

  -- Reuse a still-pending trade between this pair if one exists, so
  -- a seller tapping the button twice doesn't litter QRs.
  select t.id, t.qr_token into trade_id, qr_token
    from public.trades t
   where t.conversation_id = p_conversation_id
     and t.seller_id = uid
     and t.status = 'pending'
   order by t.created_at desc
   limit 1;
  if trade_id is not null then
    return next;
    return;
  end if;

  -- 24-byte URL-safe random token, hex-encoded → 48 chars.
  token := encode(gen_random_bytes(24), 'hex');

  insert into public.trades (
    conversation_id, seller_id, buyer_id, listing_id, qr_token
  ) values (
    p_conversation_id, uid, buyer, p_listing_id, token
  )
  returning id, qr_token into trade_id, qr_token;

  return next;
end;
$$;

revoke all on function public.start_trade(uuid, uuid) from public;
grant execute on function public.start_trade(uuid, uuid) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 5) RPC: confirm_trade — buyer scans the QR in person
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

  trade_id        := rec.id;
  conversation_id := rec.conversation_id;
  seller_id       := rec.seller_id;
  buyer_id        := rec.buyer_id;
  return next;
end;
$$;

revoke all on function public.confirm_trade(text) from public;
grant execute on function public.confirm_trade(text) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 6) RPC: rate_trade — submit a 1–5 star rating + optional comment
-- ────────────────────────────────────────────────────────────
create or replace function public.rate_trade(
  p_trade_id uuid,
  p_stars    int,
  p_comment  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.trades%rowtype;
  rated uuid;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;
  if p_stars < 1 or p_stars > 5 then
    raise exception 'invalid_stars';
  end if;

  select * into rec from public.trades where id = p_trade_id;
  if not found then
    raise exception 'trade_not_found';
  end if;
  if rec.status <> 'completed' then
    raise exception 'trade_not_completed';
  end if;

  if uid = rec.seller_id then
    rated := rec.buyer_id;
  elsif uid = rec.buyer_id then
    rated := rec.seller_id;
  else
    raise exception 'not_party';
  end if;

  insert into public.trade_ratings (trade_id, rater_id, rated_id, stars, comment)
  values (p_trade_id, uid, rated, p_stars, nullif(trim(p_comment), ''));

  -- Update the rated user's running aggregates. reputation is the
  -- average × 10 so we keep one decimal of precision in an int.
  update public.profiles
     set rating_count = rating_count + 1,
         rating_sum   = rating_sum + p_stars,
         reputation   = case
           when rating_count + 1 = 0 then 0
           else round(((rating_sum + p_stars)::numeric / (rating_count + 1)) * 10)
         end
   where id = rated;
end;
$$;

revoke all on function public.rate_trade(uuid, int, text) from public;
grant execute on function public.rate_trade(uuid, int, text) to authenticated;
