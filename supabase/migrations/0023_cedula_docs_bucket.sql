-- Cédula photo storage. The publish gate now asks for a picture of
-- the user's national ID, both as a fraud signal and so support can
-- verify identity if a dispute escalates.
--
-- Hard rules:
-- - Bucket is PRIVATE. Public URLs from this bucket return 400.
-- - Each user can only read / write objects under their own folder
--   (`{user_id}/...`). Service role bypasses RLS for support tools.
-- - We store only the storage path on profile_contact, never a URL —
--   any read goes through a signed URL minted at request time so
--   the photo can't leak via a stale link.

-- ────────────────────────────────────────────────────────────
-- 1) Bucket
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('cedula-docs', 'cedula-docs', false)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- 2) RLS — owner-only access, scoped to the {uid}/ prefix.
-- ────────────────────────────────────────────────────────────
drop policy if exists "cedula_upload_self" on storage.objects;
create policy "cedula_upload_self"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cedula-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "cedula_select_self" on storage.objects;
create policy "cedula_select_self"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cedula-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "cedula_update_self" on storage.objects;
create policy "cedula_update_self"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cedula-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "cedula_delete_self" on storage.objects;
create policy "cedula_delete_self"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cedula-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ────────────────────────────────────────────────────────────
-- 3) profile_contact: store the storage path of the latest photo.
-- ────────────────────────────────────────────────────────────
alter table public.profile_contact
  add column if not exists national_id_photo_path text;
