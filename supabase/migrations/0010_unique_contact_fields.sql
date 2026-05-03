-- Enforce that the contact info attached to a profile is unique:
-- the same WhatsApp number and the same national ID must not appear
-- on more than one account. Without this, two users could both fill
-- the publish gate with the same phone, sidestepping the auth-email
-- uniqueness baked into the phone+PIN signup flow.

-- 1) Normalise whatsapp + national_id to digits-only on insert/update.
--    Keeps comparisons in the unique index consistent regardless of
--    how the user typed their number (with spaces, +, parens, etc).
create or replace function public.profile_contact_normalize()
returns trigger
language plpgsql
as $$
begin
  if new.whatsapp is not null then
    new.whatsapp := regexp_replace(new.whatsapp, '\D', '', 'g');
  end if;
  if new.national_id is not null then
    new.national_id := regexp_replace(new.national_id, '\D', '', 'g');
  end if;
  return new;
end;
$$;

drop trigger if exists profile_contact_normalize_trg on public.profile_contact;
create trigger profile_contact_normalize_trg
  before insert or update on public.profile_contact
  for each row execute function public.profile_contact_normalize();

-- 2) Backfill any existing rows so the unique index can be built.
update public.profile_contact
set
  whatsapp    = regexp_replace(whatsapp,    '\D', '', 'g'),
  national_id = regexp_replace(national_id, '\D', '', 'g')
where
  whatsapp    ~ '\D'
  or national_id ~ '\D';

-- 3) Unique indexes. Use indexes (not column constraints) so we can
--    add a partial filter on non-empty values, which avoids blocking
--    the rare case where backfills left an empty string.
create unique index if not exists profile_contact_whatsapp_unique
  on public.profile_contact (whatsapp)
  where whatsapp <> '';

create unique index if not exists profile_contact_national_id_unique
  on public.profile_contact (national_id)
  where national_id <> '';
