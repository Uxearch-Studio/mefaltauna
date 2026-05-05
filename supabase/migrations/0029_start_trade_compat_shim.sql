-- Backwards-compat shim for the OLD start_trade signature.
--
-- 0027 dropped public.start_trade(uuid, uuid) in favour of the new
-- array variant public.start_trade(uuid, uuid[]). Migrations are
-- atomic on the DB but the client + server-action JS bundle ships
-- via Vercel and rolls out asynchronously, so for a few minutes
-- after the migration the old build is still calling the old
-- signature — and getting "function start_trade(uuid, uuid) does
-- not exist", which surfaces in the chat as "no pudimos procesar".
--
-- Re-create the old signature as a thin wrapper that forwards to
-- the array variant. New builds keep using the array form directly;
-- old builds keep working until they're replaced. Once we're sure
-- every client is on the new build, this shim can be dropped.

create or replace function public.start_trade(
  p_conversation_id uuid,
  p_listing_id      uuid
)
returns table (trade_id uuid, qr_token text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_ids uuid[];
begin
  v_ids := case
    when p_listing_id is null then array[]::uuid[]
    else array[p_listing_id]
  end;
  return query
    select * from public.start_trade(p_conversation_id, v_ids);
end;
$$;

revoke all on function public.start_trade(uuid, uuid) from public;
grant execute on function public.start_trade(uuid, uuid) to authenticated;
