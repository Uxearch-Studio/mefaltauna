-- Add `neighborhood` to profile_contact so the publish gate can ask
-- for both city + barrio. This lets buyers/sellers find each other
-- locally without sharing exact addresses.
--
-- Stays as plain text for now; if we plug Google Places later it
-- will populate the same column with the place's primary text.

alter table public.profile_contact
  add column if not exists neighborhood text;
