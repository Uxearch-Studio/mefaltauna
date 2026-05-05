-- Supabase Realtime postgres_changes broadcasts UPDATE events using
-- the WAL. With the default REPLICA IDENTITY (DEFAULT, i.e. primary
-- key only), the WAL only contains the changed columns and the PK on
-- UPDATE. That means filters like `user_a=eq.<uid>` evaluated against
-- a row whose user_a *didn't* change in the UPDATE may not see the
-- column at all, and the event is silently dropped before reaching
-- the subscriber.
--
-- REPLICA IDENTITY FULL forces every UPDATE to write the whole row
-- (OLD + NEW) to the WAL, which lets Realtime evaluate any filter
-- regardless of which columns the UPDATE touched. This is the
-- standard remedy for "filtered postgres_changes UPDATE
-- subscriptions never fire" in Supabase.
--
-- We apply this to `conversations` (so the inbox bottom-nav badge and
-- the inbox list update live when last_message_at bumps) and
-- `messages` (so any future filtered subscription on messages also
-- works reliably).

alter table public.conversations replica identity full;
alter table public.messages       replica identity full;
