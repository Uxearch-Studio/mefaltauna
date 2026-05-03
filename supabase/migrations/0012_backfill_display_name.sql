-- Backfill display_name + city on the public profiles table for any
-- account that has already filled the publish gate. Earlier code
-- shipped before the profiles.update was added, so historical records
-- still have NULL display_name even though profile_contact has the
-- first/last name. The FUT card and the inbox both rely on
-- display_name for the public name, so without this backfill those
-- accounts show "Usuario" / generic fallbacks.

update public.profiles p
set
  display_name = trim(both ' ' from
    pc.first_name || ' ' ||
    coalesce(nullif(substr(pc.last_name, 1, 1), ''), '') ||
    case when pc.last_name <> '' then '.' else '' end
  ),
  city = coalesce(nullif(p.city, ''), pc.city)
from public.profile_contact pc
where p.id = pc.user_id
  and (p.display_name is null or p.display_name = '');

-- Mirror display_name into auth.users.raw_user_meta_data so the
-- Supabase admin UI shows it under the "Display name" column. Using
-- jsonb || merges the new key while preserving any existing keys
-- (e.g. the phone field set during signup).
update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'display_name', p.display_name,
    'first_name', pc.first_name,
    'last_name', pc.last_name
  )
from public.profiles p, public.profile_contact pc
where p.id = u.id
  and pc.user_id = u.id
  and p.display_name is not null
  and p.display_name <> '';
