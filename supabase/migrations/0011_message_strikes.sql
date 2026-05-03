-- Anti-PII guard for the inbox.
-- Every message that contains a phone number or an email address is
-- rejected by the server action and the sender accumulates a "strike".
-- Three strikes block the account: the user can no longer send chats
-- and they can't sign back in. This migration provides the schema +
-- helper RPC that the server action calls.

alter table public.profiles
  add column if not exists strikes int not null default 0,
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_at timestamptz;

-- Atomic increment: bumps the strike counter and, when the new value
-- crosses 3, flips is_blocked. Returning the post-increment row lets
-- the caller render "Aviso N de 3" without an extra round trip.
create or replace function public.bump_strike(target uuid)
returns table (strikes int, is_blocked boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_strikes int;
  blocked boolean;
begin
  -- Only the user themselves can be the target of their own strike —
  -- guard against tampering through the RPC interface.
  if target is null or target <> auth.uid() then
    raise exception 'unauthorized';
  end if;

  update public.profiles
    set strikes = profiles.strikes + 1
    where id = target
    returning profiles.strikes into new_strikes;

  if new_strikes is null then
    raise exception 'profile_not_found';
  end if;

  if new_strikes >= 3 then
    update public.profiles
      set is_blocked = true,
          blocked_at = coalesce(blocked_at, now())
      where id = target
      returning profiles.is_blocked into blocked;
  else
    blocked := false;
  end if;

  return query select new_strikes, blocked;
end;
$$;

revoke all on function public.bump_strike(uuid) from public;
grant execute on function public.bump_strike(uuid) to authenticated;
