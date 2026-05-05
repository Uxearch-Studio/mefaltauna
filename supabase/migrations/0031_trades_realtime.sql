-- Realtime for trades + trade_items.
--
-- Until now neither table was in the supabase_realtime publication,
-- so the trade flow had no live signal across devices: when the
-- seller activated a deal, the buyer's chat had no way to know the
-- pending trade existed without a manual reload, and when the buyer
-- scanned the seller's chat had no way to know the trade had been
-- confirmed (so the seller never saw the rating modal).
--
-- Add both tables to the publication and set REPLICA IDENTITY FULL
-- so filtered postgres_changes UPDATE subscriptions evaluate
-- correctly (same lesson as 0026 for conversations/messages).

alter table public.trades       replica identity full;
alter table public.trade_items  replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.trades;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.trade_items;
exception when duplicate_object then null; end $$;
