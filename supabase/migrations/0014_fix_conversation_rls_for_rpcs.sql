-- Two production bugs traced back to the same root cause:
--   - "el badge de mensajes pendientes sigue apareciendo aun cuando ya
--      leí la conversación"
--   - "elimino una conversación y al volver a la lista sigue ahí"
--
-- The conversations table only had SELECT + INSERT RLS policies — no
-- UPDATE policy. Both `mark_conversation_read` and `archive_conversation`
-- were declared SECURITY INVOKER, which means they run with the caller's
-- RLS rules. With no matching UPDATE policy, the UPDATE statements
-- inside the functions silently affected zero rows. No error was
-- returned, so client code thought the operation had succeeded.
--
-- Fix: add an UPDATE policy that lets each participant change their own
-- view-state columns (last_read_at_*, archived_at_*), AND swap both
-- RPCs to SECURITY DEFINER with a fixed search_path so they're robust
-- against future RLS tightening too.

-- ────────────────────────────────────────────────────────────
-- 1) UPDATE policy: participants can update their own view state
-- ────────────────────────────────────────────────────────────
drop policy if exists "conv_update_participant" on public.conversations;

create policy "conv_update_participant"
  on public.conversations for update
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ────────────────────────────────────────────────────────────
-- 2) mark_conversation_read — SECURITY DEFINER + locked search_path
-- ────────────────────────────────────────────────────────────
create or replace function public.mark_conversation_read(conv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;

  update public.conversations
     set last_read_at_a = case when user_a = uid then now() else last_read_at_a end,
         last_read_at_b = case when user_b = uid then now() else last_read_at_b end
   where id = conv_id
     and (user_a = uid or user_b = uid);
end;
$$;

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 3) archive_conversation — SECURITY DEFINER + locked search_path
-- ────────────────────────────────────────────────────────────
create or replace function public.archive_conversation(conv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;

  update public.conversations
     set archived_at_a = case when user_a = uid then now() else archived_at_a end,
         archived_at_b = case when user_b = uid then now() else archived_at_b end
   where id = conv_id
     and (user_a = uid or user_b = uid);
end;
$$;

revoke all on function public.archive_conversation(uuid) from public;
grant execute on function public.archive_conversation(uuid) to authenticated;
