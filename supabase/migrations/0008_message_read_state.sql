-- Phase 4.1 — message read state per participant.
-- last_read_at_a / last_read_at_b track when each participant last
-- viewed the conversation so we can compute unread counts cheaply.

alter table public.conversations
  add column if not exists last_read_at_a timestamptz,
  add column if not exists last_read_at_b timestamptz;

-- RPC to mark a conversation as read by the current user (sets the
-- correct column based on which side of the pair they're on).
create or replace function public.mark_conversation_read(conv_id uuid)
returns void
language plpgsql
security invoker
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
