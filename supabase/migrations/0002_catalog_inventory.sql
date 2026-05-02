-- mefaltauna — phase 3 schema
-- catalog of all Panini stickers + per-user inventory, wishlist and listings.

create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- enums
-- ────────────────────────────────────────────────────────────
do $$ begin
  create type public.sticker_type as enum ('player', 'badge', 'group', 'stadium', 'legend', 'special');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_type as enum ('trade', 'sale', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_status as enum ('active', 'sold', 'cancelled');
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────
-- sticker_catalog
-- ────────────────────────────────────────────────────────────
create table if not exists public.sticker_catalog (
  id          serial primary key,
  code        text unique not null,
  type        public.sticker_type not null,
  team_code   text,
  number      integer,
  name        text not null,
  is_shiny    boolean not null default false,
  position    text,
  album_page  integer,
  created_at  timestamptz not null default now()
);

create index if not exists sticker_catalog_team_idx on public.sticker_catalog (team_code);
create index if not exists sticker_catalog_type_idx on public.sticker_catalog (type);
create index if not exists sticker_catalog_page_idx on public.sticker_catalog (album_page);

alter table public.sticker_catalog enable row level security;

drop policy if exists "catalog_select_all" on public.sticker_catalog;
create policy "catalog_select_all"
  on public.sticker_catalog for select
  using (true);

-- ────────────────────────────────────────────────────────────
-- inventory
-- ────────────────────────────────────────────────────────────
create table if not exists public.inventory (
  user_id     uuid not null references auth.users(id) on delete cascade,
  sticker_id  integer not null references public.sticker_catalog(id) on delete cascade,
  count       integer not null default 1 check (count >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, sticker_id)
);

create index if not exists inventory_user_idx on public.inventory (user_id);

alter table public.inventory enable row level security;

drop policy if exists "inventory_select_self" on public.inventory;
drop policy if exists "inventory_insert_self" on public.inventory;
drop policy if exists "inventory_update_self" on public.inventory;
drop policy if exists "inventory_delete_self" on public.inventory;

create policy "inventory_select_self"
  on public.inventory for select
  using (auth.uid() = user_id);

create policy "inventory_insert_self"
  on public.inventory for insert
  with check (auth.uid() = user_id);

create policy "inventory_update_self"
  on public.inventory for update
  using (auth.uid() = user_id);

create policy "inventory_delete_self"
  on public.inventory for delete
  using (auth.uid() = user_id);

drop trigger if exists inventory_set_updated_at on public.inventory;
create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- wishlist
-- ────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id     uuid not null references auth.users(id) on delete cascade,
  sticker_id  integer not null references public.sticker_catalog(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, sticker_id)
);

alter table public.wishlist enable row level security;

drop policy if exists "wishlist_select_self" on public.wishlist;
drop policy if exists "wishlist_insert_self" on public.wishlist;
drop policy if exists "wishlist_delete_self" on public.wishlist;

create policy "wishlist_select_self"
  on public.wishlist for select
  using (auth.uid() = user_id);

create policy "wishlist_insert_self"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "wishlist_delete_self"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- listings (publication of a sticker for trade/sale)
-- ────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sticker_id  integer not null references public.sticker_catalog(id) on delete cascade,
  type        public.listing_type not null,
  price_cop   integer check (price_cop is null or price_cop >= 0),
  status      public.listing_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists listings_status_idx  on public.listings (status);
create index if not exists listings_created_idx on public.listings (created_at desc);
create index if not exists listings_user_idx    on public.listings (user_id);
create index if not exists listings_sticker_idx on public.listings (sticker_id);

alter table public.listings enable row level security;

drop policy if exists "listings_select_active" on public.listings;
drop policy if exists "listings_insert_self"   on public.listings;
drop policy if exists "listings_update_self"   on public.listings;
drop policy if exists "listings_delete_self"   on public.listings;

create policy "listings_select_active"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

create policy "listings_insert_self"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "listings_update_self"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "listings_delete_self"
  on public.listings for delete
  using (auth.uid() = user_id);

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- realtime: enable for the live feed
-- ────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.listings;
exception when duplicate_object then null; end $$;
