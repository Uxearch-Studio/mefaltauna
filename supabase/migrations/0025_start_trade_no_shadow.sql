-- Defensive rewrite of start_trade.
--
-- The previous version named its OUT parameters trade_id / qr_token,
-- the SAME names as columns on public.trades. PL/pgSQL allows that,
-- but the parser's column-vs-variable resolution inside SELECT INTO
-- and RETURNING INTO lists can be brittle — depending on the project's
-- plpgsql.variable_conflict setting it either prefers the variable or
-- the column, and a mismatch surfaces as a confusing runtime error
-- that the chat just renders as "no pudimos procesar".
--
-- Rewrite using local variables that can't collide with column names,
-- and assemble the OUT params at the very end as the only thing they
-- ever hold. Behaviour and signature are unchanged.

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
  uid          uuid := auth.uid();
  conv         public.conversations%rowtype;
  v_buyer      uuid;
  v_token      text;
  v_trade_id   uuid;
  v_qr_token   text;
  v_listing    public.listings%rowtype;
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
    select * into v_listing from public.listings where id = p_listing_id;
    if not found then
      raise exception 'listing_not_found';
    end if;
    if v_listing.user_id = uid then
      v_buyer := case when conv.user_a = uid then conv.user_b else conv.user_a end;
    else
      raise exception 'caller_not_seller';
    end if;
  else
    v_buyer := case when conv.user_a = uid then conv.user_b else conv.user_a end;
  end if;

  -- Reuse a pending trade for the same (conversation, seller) pair.
  select t.id, t.qr_token
    into v_trade_id, v_qr_token
    from public.trades t
   where t.conversation_id = p_conversation_id
     and t.seller_id = uid
     and t.status = 'pending'
   order by t.created_at desc
   limit 1;

  if v_trade_id is null then
    -- 48-char hex token from two UUIDs concatenated.
    v_token := substr(
      replace(gen_random_uuid()::text, '-', '') ||
      replace(gen_random_uuid()::text, '-', ''),
      1, 48
    );

    insert into public.trades (
      conversation_id, seller_id, buyer_id, listing_id, qr_token
    ) values (
      p_conversation_id, uid, v_buyer, p_listing_id, v_token
    )
    returning id, qr_token into v_trade_id, v_qr_token;
  end if;

  trade_id := v_trade_id;
  qr_token := v_qr_token;
  return next;
end;
$$;

revoke all on function public.start_trade(uuid, uuid) from public;
grant execute on function public.start_trade(uuid, uuid) to authenticated;
