-- Mirror national_id + city + whatsapp from profile_contact into
-- auth.users.raw_user_meta_data for every historical row that was
-- created before saveContactAction / updateProfileAction started
-- writing those fields. Without this, the Supabase Auth admin panel's
-- user detail drawer is empty for legacy accounts even though the
-- data exists in profile_contact.
--
-- Migration 0012 already mirrored display_name + first_name + last_name.
-- This pass adds the remaining contact fields. We use jsonb || which
-- merges keys without dropping anything that was already there.

update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'national_id', pc.national_id,
    'city',        pc.city,
    'whatsapp',    pc.whatsapp
  )
from public.profile_contact pc
where pc.user_id = u.id;
