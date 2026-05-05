-- Same column-vs-OUT-param shadowing bug as start_trade, but in
-- confirm_trade. The function returns table(trade_id, conversation_id,
-- seller_id, buyer_id), and inside the body it does:
--
--   update public.listings set status = 'sold'
--   where id in (
--     select listing_id from public.trade_items where trade_id = rec.id
--   ) ...
--
-- That `trade_id` in the subquery WHERE clause is ambiguous: it
-- could be the OUT parameter or the public.trade_items.trade_id
-- column. PL/pgSQL raises 42702 and the action surfaces it as the
-- generic "no pudimos procesar" toast.
--
-- Fix the same way as 0028 fixed start_trade: prepend
-- `#variable_conflict use_column` so column names win when bare
-- identifiers appear in SQL clauses. The OUT params are still set
-- by direct assignment at the end of the function body.

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
#variable_conflict use_column
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

revoke all on function public.confirm_trade(text) from public;
grant execute on function public.confirm_trade(text) to authenticated;
