-- Membership gate + Wompi payment ledger.
--
-- mefaltauna gates inbox + chat behind a single one-time pass. Once a
-- payment lands as APPROVED on Wompi, our webhook flips
-- `profiles.is_member = true` and chat unlocks. Every transaction is
-- logged in `payments` so support can reconcile against Wompi later.
--
-- We store the wompi_reference (a unique id we generate per attempt)
-- and the wompi_transaction_id (returned by Wompi after the user
-- completes checkout). Either can be used to look up a record.

-- ────────────────────────────────────────────────────────────
-- 1) profiles: membership flags
-- ────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_member boolean not null default false,
  add column if not exists membership_paid_at timestamptz,
  add column if not exists membership_payment_id uuid;

-- ────────────────────────────────────────────────────────────
-- 2) payments table
-- ────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  amount_cop            int not null check (amount_cop > 0),
  currency              text not null default 'COP',
  -- Reference WE generate before sending the user to Wompi. Unique so
  -- a retry doesn't get associated with the wrong transaction.
  wompi_reference       text not null unique,
  -- Transaction id returned by Wompi once they create the record.
  -- Nullable because we insert the row before Wompi assigns it.
  wompi_transaction_id  text unique,
  status                text not null check (
    status in ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')
  ),
  -- Raw event payload from the latest webhook for support / audit.
  raw_event             jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists payments_user_id_idx
  on public.payments (user_id, created_at desc);
create index if not exists payments_status_idx
  on public.payments (status);

-- updated_at trigger reuses the helper from migration 0001.
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

-- Users can read their own payments — useful for the "membership
-- status" panel and for support diagnostics in-app.
drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self"
  on public.payments for select
  using (auth.uid() = user_id);

-- All writes happen through the service-role webhook + the
-- security-definer RPC below, so we don't grant insert/update to
-- regular users.

-- ────────────────────────────────────────────────────────────
-- 3) RPC: webhook reconciliation entry point
-- ────────────────────────────────────────────────────────────
-- Runs as SECURITY DEFINER so the webhook handler (using the service
-- role anyway) doesn't trip RLS. Idempotent — re-receiving the same
-- transaction status doesn't create duplicates.
create or replace function public.apply_wompi_payment(
  p_reference          text,
  p_transaction_id     text,
  p_status             text,
  p_amount_cop         int,
  p_event              jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.payments%rowtype;
begin
  if p_status not in ('PENDING','APPROVED','DECLINED','VOIDED','ERROR') then
    raise exception 'invalid_status: %', p_status;
  end if;

  -- Locate the payment row WE created at session-start time, keyed by
  -- the reference we passed to Wompi.
  select * into rec from public.payments where wompi_reference = p_reference;
  if not found then
    raise exception 'payment_not_found: %', p_reference;
  end if;

  -- Don't overwrite a terminal state with a non-terminal one (e.g. a
  -- delayed PENDING webhook arriving after APPROVED).
  if rec.status = 'APPROVED' and p_status <> 'APPROVED' then
    return;
  end if;

  update public.payments
     set status               = p_status,
         wompi_transaction_id = coalesce(wompi_transaction_id, p_transaction_id),
         amount_cop           = coalesce(amount_cop, p_amount_cop),
         raw_event            = p_event
   where id = rec.id;

  if p_status = 'APPROVED' then
    update public.profiles
       set is_member             = true,
           membership_paid_at    = coalesce(membership_paid_at, now()),
           membership_payment_id = coalesce(membership_payment_id, rec.id)
     where id = rec.user_id;
  end if;
end;
$$;

revoke all on function public.apply_wompi_payment(
  text, text, text, int, jsonb
) from public;
grant execute on function public.apply_wompi_payment(
  text, text, text, int, jsonb
) to authenticated, anon;
