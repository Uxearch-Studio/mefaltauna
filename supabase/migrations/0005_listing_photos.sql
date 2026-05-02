-- Phase 3.6 — listing photos
-- Adds an optional photo_url to listings and a public Storage bucket
-- where users can upload images of the sticker they're publishing.

alter table public.listings
  add column if not exists photo_url text;

-- ────────────────────────────────────────────────────────────
-- Storage bucket: listing-photos
-- Public read so the feed (and unauthenticated landing previews
-- later) can render thumbnails. Writes scoped to the uploader's
-- own folder via auth.uid() prefix.
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "Listing photos public read"          on storage.objects;
drop policy if exists "Users upload listing photos"         on storage.objects;
drop policy if exists "Users delete own listing photos"     on storage.objects;

create policy "Listing photos public read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Users upload listing photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own listing photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
