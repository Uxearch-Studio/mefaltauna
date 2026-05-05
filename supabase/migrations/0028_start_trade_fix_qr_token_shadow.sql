-- start_trade was raising "column reference qr_token is ambiguous"
-- on every call. The function declares an OUT parameter `qr_token`
-- (via RETURNS TABLE) which has the same name as a real column on
-- public.trades. Inside `RETURNING id, qr_token INTO v_trade_id,
-- v_qr_token`, PL/pgSQL can't tell whether `qr_token` in the
-- column-list refers to the table column or the OUT param.
--
-- 0025 fixed this kind of clash by introducing internal v_* locals
-- to assign at the end, but the new array-variant in 0027 still has
-- the bare `qr_token` in the RETURNING list, which trips the same
-- parser path that the original 0024 fix dodged. Migration 0024 has
-- since been superseded; the live function is from 0027 and
-- ambiguous.
--
-- Add `#variable_conflict use_column` at the top of the function so
-- PL/pgSQL resolves bare column names against table columns first.
-- The OUT params are still settable via direct assignment at the
-- end of the function (which we already do).

create or replace function public.start_trade(
  p_conversation_id uuid,
  p_listing_ids     uuid[]
)
returns table (trade_id uuid, qr_token text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
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

  foreach lid in array p_listing_ids loop
    select * into v_listing from public.listings where id = lid;
    if not found then
      raise exception 'listing_not_found';
    end if;
    if v_listing.user_id <> uid then
      raise exception 'caller_not_seller';
    end if;
  end loop;

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
