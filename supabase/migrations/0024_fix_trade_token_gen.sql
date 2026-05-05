-- Fix: start_trade RPC was failing in production with "no pudimos
-- procesar" because it called encode(gen_random_bytes(24), 'hex')
-- and gen_random_bytes lives inside the pgcrypto extension. On the
-- Supabase project schema search path, that resolves to
-- extensions.gen_random_bytes — but the function was originally
-- defined with `set search_path = public`, so the call missed.
--
-- Switch the token generator to a pair of gen_random_uuid() calls
-- concatenated and stripped of dashes. gen_random_uuid is now part
-- of pg_catalog so it works without any extension namespace, and
-- two UUIDs give us 64 hex chars — we slice to 48 to keep the QR
-- payload identical to what the client already expects.

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

  if p_listing_id is not null then
    select user_id into buyer from public.listings where id = p_listing_id;
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

  -- Reuse a still-pending trade between this pair if one exists.
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

  -- 48-char hex token from two UUIDs concatenated. gen_random_uuid
  -- is built-in (pg_catalog) so it works regardless of which
  -- extensions are installed.
  token := substr(
    replace(gen_random_uuid()::text, '-', '') ||
    replace(gen_random_uuid()::text, '-', ''),
    1, 48
  );

  insert into public.trades (
    conversation_id, seller_id, buyer_id, listing_id, qr_token
  ) values (
    p_conversation_id, uid, buyer, p_listing_id, token
  )
  returning id, qr_token into trade_id, qr_token;

  return next;
end;
$$;
