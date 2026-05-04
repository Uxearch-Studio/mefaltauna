-- Two structural problems with the inbox surfaced in production:
-- 1. The `(user_a, user_b, listing_id)` unique key let the same pair
--    of users own multiple conversation rows whenever they touched
--    different listings (or whenever listing_id was NULL on either
--    side, since NULLs aren't deduplicated by Postgres unique). The
--    UX expects a single thread per pair, regardless of which sticker
--    started the chat.
-- 2. There was no way for a user to remove a conversation from their
--    inbox. This adds soft-delete columns so each side can hide the
--    thread without affecting the other party's copy.

-- ────────────────────────────────────────────────────────────
-- 1) Merge duplicate conversations per pair
-- ────────────────────────────────────────────────────────────
do $$
declare
  rec record;
  keep_id uuid;
begin
  for rec in
    select user_a, user_b, count(*)::int as n
      from public.conversations
     group by user_a, user_b
    having count(*) > 1
  loop
    -- Pick the most recently active row as the canonical one.
    select id into keep_id
      from public.conversations
     where user_a = rec.user_a and user_b = rec.user_b
     order by last_message_at desc, created_at desc
     limit 1;

    -- Move every message from the duplicates into the canonical row.
    update public.messages m
       set conversation_id = keep_id
      from public.conversations c
     where m.conversation_id = c.id
       and c.user_a = rec.user_a
       and c.user_b = rec.user_b
       and c.id <> keep_id;

    -- Update last_message_at on the canonical row to the latest
    -- timestamp across the merged set.
    update public.conversations
       set last_message_at = (
         select max(created_at)
           from public.messages
          where conversation_id = keep_id
       )
     where id = keep_id;

    -- Delete the now-empty duplicate rows.
    delete from public.conversations
     where user_a = rec.user_a
       and user_b = rec.user_b
       and id <> keep_id;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────
-- 2) Tighten the unique key: one conversation per pair
-- ────────────────────────────────────────────────────────────
alter table public.conversations
  drop constraint if exists conversations_user_a_user_b_listing_id_key;

-- Belt-and-suspenders: also drop any earlier index name variants the
-- migration history may have produced.
drop index if exists conversations_user_a_user_b_listing_id_key;

create unique index if not exists conversations_pair_unique
  on public.conversations (user_a, user_b);

-- ────────────────────────────────────────────────────────────
-- 3) Soft-delete columns (per side)
-- ────────────────────────────────────────────────────────────
alter table public.conversations
  add column if not exists archived_at_a timestamptz,
  add column if not exists archived_at_b timestamptz;

-- Helper RPC: archives the current user's view of the conversation.
-- security_invoker ensures RLS still gates the underlying update.
create or replace function public.archive_conversation(conv_id uuid)
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
     set archived_at_a = case when user_a = uid then now() else archived_at_a end,
         archived_at_b = case when user_b = uid then now() else archived_at_b end
   where id = conv_id
     and (user_a = uid or user_b = uid);
end;
$$;

revoke all on function public.archive_conversation(uuid) from public;
grant execute on function public.archive_conversation(uuid) to authenticated;
