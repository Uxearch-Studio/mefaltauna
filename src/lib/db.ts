import type { SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────
// Types — kept in sync with the SQL schema in supabase/migrations.
// Will be replaced by `supabase gen types typescript` later.
// ────────────────────────────────────────────────────────────

export type StickerType =
  | "player"
  | "badge"
  | "group"
  | "stadium"
  | "legend"
  | "special";

export type Sticker = {
  id: number;
  code: string;
  type: StickerType;
  team_code: string | null;
  number: number | null;
  name: string;
  is_shiny: boolean;
  position: string | null;
  album_page: number | null;
};

export type InventoryRow = {
  sticker_id: number;
  count: number;
};

export type ListingType = "trade" | "sale" | "both";
export type ListingStatus = "active" | "sold" | "cancelled";

export type Listing = {
  id: string;
  user_id: string;
  sticker_id: number;
  type: ListingType;
  price_cop: number | null;
  status: ListingStatus;
  created_at: string;
};

export type FeedItem = Listing & {
  sticker: Pick<Sticker, "code" | "name" | "team_code" | "type" | "number">;
  username: string | null;
};

// ────────────────────────────────────────────────────────────
// Catalog
// ────────────────────────────────────────────────────────────

export async function fetchCatalog(supabase: SupabaseClient): Promise<Sticker[]> {
  const { data, error } = await supabase
    .from("sticker_catalog")
    .select(
      "id, code, type, team_code, number, name, is_shiny, position, album_page",
    )
    .order("album_page", { ascending: true })
    .order("number", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data ?? []) as Sticker[];
}

// ────────────────────────────────────────────────────────────
// Inventory
// ────────────────────────────────────────────────────────────

export async function fetchInventory(
  supabase: SupabaseClient,
  userId: string,
): Promise<InventoryRow[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("sticker_id, count")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as InventoryRow[];
}

// ────────────────────────────────────────────────────────────
// Listings
// ────────────────────────────────────────────────────────────

export async function fetchActiveListings(
  supabase: SupabaseClient,
  limit = 30,
): Promise<FeedItem[]> {
  // Listings + their sticker, joined via the FK on sticker_id.
  // profiles.id has no direct FK to listings.user_id (both reference
  // auth.users) so we fetch usernames in a second batched query and
  // merge in JS.
  // Two FKs link listings → sticker_catalog (sticker_id and wants_sticker_id),
  // so PostgREST needs the explicit constraint name to disambiguate.
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id, user_id, sticker_id, type, price_cop, status, created_at,
      sticker:sticker_catalog!listings_sticker_id_fkey ( code, name, team_code, type, number )
      `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    user_id: string;
    sticker_id: number;
    type: ListingType;
    price_cop: number | null;
    status: ListingStatus;
    created_at: string;
    sticker: FeedItem["sticker"];
  }>;

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const usernames = new Map<string, string | null>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);
    for (const p of (profiles ?? []) as Array<{ id: string; username: string | null }>) {
      usernames.set(p.id, p.username);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    sticker_id: row.sticker_id,
    type: row.type,
    price_cop: row.price_cop,
    status: row.status,
    created_at: row.created_at,
    sticker: row.sticker,
    username: usernames.get(row.user_id) ?? null,
  }));
}
