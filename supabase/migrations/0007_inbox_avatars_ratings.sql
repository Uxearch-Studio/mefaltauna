-- Phase 4 — inbox + ratings + avatars + payment methods on listings.

-- ────────────────────────────────────────────────────────────
-- conversations
-- Stable pair of users (sorted alphabetically) optionally tied to a listing.
-- ────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  user_a           uuid not null references auth.users(id) on delete cascade,
  user_b           uuid not null references auth.users(id) on delete cascade,
  listing_id       uuid references public.listings(id) on delete set null,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b, listing_id)
);

create index if not exists conversations_user_a_idx     on public.conversations (user_a, last_message_at desc);
create index if not exists conversations_user_b_idx     on public.conversations (user_b, last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists "conv_select_participant" on public.conversations;
drop policy if exists "conv_insert_participant" on public.conversations;

create policy "conv_select_participant"
  on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "conv_insert_participant"
  on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ────────────────────────────────────────────────────────────
-- messages
-- ────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references auth.users(id) on delete cascade,
  body             text not null check (length(body) > 0 and length(body) <= 2000),
  created_at       timestamptz not null default now()
);

create index if not exists messages_conv_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "msg_select_participant" on public.messages;
drop policy if exists "msg_insert_participant" on public.messages;

create policy "msg_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "msg_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Bump the parent conversation's last_message_at on every new message.
create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_update_conversation on public.messages;
create trigger messages_update_conversation
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- Realtime subscriptions
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────
-- ratings — both parties rate each other after a closed deal
-- ────────────────────────────────────────────────────────────
create table if not exists public.ratings (
  id           uuid primary key default gen_random_uuid(),
  rater_id     uuid not null references auth.users(id) on delete cascade,
  rated_id     uuid not null references auth.users(id) on delete cascade,
  listing_id   uuid references public.listings(id) on delete set null,
  stars        smallint not null check (stars between 1 and 5),
  comment      text check (comment is null or length(comment) <= 500),
  created_at   timestamptz not null default now(),
  unique (rater_id, rated_id, listing_id)
);

create index if not exists ratings_rated_idx on public.ratings (rated_id);

alter table public.ratings enable row level security;

drop policy if exists "ratings_select_public" on public.ratings;
drop policy if exists "ratings_insert_self"   on public.ratings;

create policy "ratings_select_public"
  on public.ratings for select using (true);

create policy "ratings_insert_self"
  on public.ratings for insert
  with check (auth.uid() = rater_id);

-- ────────────────────────────────────────────────────────────
-- listings: payment method options
-- ────────────────────────────────────────────────────────────
alter table public.listings
  add column if not exists payment_methods text[] not null default array['cash', 'transfer'];

-- ────────────────────────────────────────────────────────────
-- profiles: avatar + cached reputation count
-- ────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists avatar_url text;

-- ────────────────────────────────────────────────────────────
-- avatars Storage bucket (public read, self-write into own folder)
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars public read"      on storage.objects;
drop policy if exists "Users upload own avatar"  on storage.objects;
drop policy if exists "Users update own avatar"  on storage.objects;
drop policy if exists "Users delete own avatar"  on storage.objects;

create policy "Avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
