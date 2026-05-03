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

export type ProfileContact = {
  user_id: string;
  first_name: string;
  last_name: string;
  national_id: string;
  whatsapp: string;
  city: string;
};

export async function fetchOwnContact(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileContact | null> {
  const { data, error } = await supabase
    .from("profile_contact")
    .select("user_id, first_name, last_name, national_id, whatsapp, city")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as ProfileContact | null) ?? null;
}

// ────────────────────────────────────────────────────────────
// Conversations & messages (inbox)
// ────────────────────────────────────────────────────────────

export type Conversation = {
  id: string;
  user_a: string;
  user_b: string;
  listing_id: string | null;
  last_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationListItem = {
  id: string;
  other_user_id: string;
  other_username: string | null;
  other_avatar_url: string | null;
  listing_id: string | null;
  listing_sticker_code: string | null;
  last_message_at: string;
  last_message_body: string | null;
  unread_count: number;
};

export async function fetchUserConversations(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConversationListItem[]> {
  const { data: convs, error } = await supabase
    .from("conversations")
    .select(
      "id, user_a, user_b, listing_id, last_message_at, last_read_at_a, last_read_at_b",
    )
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(60);
  if (error || !convs) return [];

  const otherIds = [
    ...new Set(
      convs.map((c) => (c.user_a === userId ? c.user_b : c.user_a) as string),
    ),
  ];
  const listingIds = [
    ...new Set(convs.map((c) => c.listing_id).filter(Boolean) as string[]),
  ];
  const conversationIds = convs.map((c) => c.id);

  const [profilesRes, listingsRes, lastMessagesRes] = await Promise.all([
    otherIds.length
      ? supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", otherIds)
      : Promise.resolve({ data: [] as Array<{ id: string; username: string | null; avatar_url: string | null }> }),
    listingIds.length
      ? supabase
          .from("listings")
          .select(
            "id, sticker:sticker_catalog!listings_sticker_id_fkey(code)",
          )
          .in("id", listingIds)
      : Promise.resolve({ data: [] as Array<{ id: string; sticker: { code: string } | null }> }),
    conversationIds.length
      ? supabase
          .from("messages")
          .select("conversation_id, body, created_at")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ conversation_id: string; body: string; created_at: string }> }),
  ]);

  const profileMap = new Map<
    string,
    { username: string | null; avatar_url: string | null }
  >();
  for (const p of (profilesRes.data ?? []) as Array<{
    id: string;
    username: string | null;
    avatar_url: string | null;
  }>) {
    profileMap.set(p.id, { username: p.username, avatar_url: p.avatar_url });
  }

  const listingMap = new Map<string, string | null>();
  for (const l of (listingsRes.data ?? []) as Array<{
    id: string;
    sticker: { code: string } | null;
  }>) {
    listingMap.set(l.id, l.sticker?.code ?? null);
  }

  const lastMsgByConv = new Map<string, string>();
  for (const m of (lastMessagesRes.data ?? []) as Array<{
    conversation_id: string;
    body: string;
  }>) {
    if (!lastMsgByConv.has(m.conversation_id)) {
      lastMsgByConv.set(m.conversation_id, m.body);
    }
  }

  // Unread count per conversation: messages from the OTHER party newer
  // than the current user's last_read_at on this conversation.
  const unreadByConv = new Map<string, number>();
  if (conversationIds.length) {
    const lastReadByConv = new Map<string, string | null>();
    for (const c of convs) {
      const isA = c.user_a === userId;
      const lr = (isA ? c.last_read_at_a : c.last_read_at_b) as
        | string
        | null;
      lastReadByConv.set(c.id as string, lr);
    }

    const { data: unreadRows } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, created_at")
      .in("conversation_id", conversationIds)
      .neq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(500);

    for (const m of (unreadRows ?? []) as Array<{
      conversation_id: string;
      sender_id: string;
      created_at: string;
    }>) {
      const lr = lastReadByConv.get(m.conversation_id);
      if (!lr || Date.parse(m.created_at) > Date.parse(lr)) {
        unreadByConv.set(
          m.conversation_id,
          (unreadByConv.get(m.conversation_id) ?? 0) + 1,
        );
      }
    }
  }

  return convs.map((c) => {
    const other = c.user_a === userId ? c.user_b : c.user_a;
    const p = profileMap.get(other);
    return {
      id: c.id as string,
      other_user_id: other as string,
      other_username: p?.username ?? null,
      other_avatar_url: p?.avatar_url ?? null,
      listing_id: c.listing_id as string | null,
      listing_sticker_code: c.listing_id
        ? (listingMap.get(c.listing_id as string) ?? null)
        : null,
      last_message_at: c.last_message_at as string,
      last_message_body: lastMsgByConv.get(c.id as string) ?? null,
      unread_count: unreadByConv.get(c.id as string) ?? 0,
    };
  });
}

/**
 * Total unread messages across all conversations of the user.
 * Used to render the badge on the bottom-nav inbox tab.
 */
export async function fetchUnreadTotal(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const convs = await fetchUserConversations(supabase, userId);
  return convs.reduce((sum, c) => sum + c.unread_count, 0);
}

export async function fetchConversation(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
): Promise<{
  conversation: Conversation;
  messages: Message[];
  otherUser: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  listingStickerCode: string | null;
} | null> {
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, user_a, user_b, listing_id, last_message_at, created_at")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return null;
  if (conv.user_a !== userId && conv.user_b !== userId) return null;

  const otherId = conv.user_a === userId ? conv.user_b : conv.user_a;

  const [{ data: msgs }, { data: profile }, listingRes] = await Promise.all([
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", otherId)
      .maybeSingle(),
    conv.listing_id
      ? supabase
          .from("listings")
          .select(
            "id, sticker:sticker_catalog!listings_sticker_id_fkey(code)",
          )
          .eq("id", conv.listing_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { sticker: { code: string } | null } | null }),
  ]);

  return {
    conversation: conv as Conversation,
    messages: (msgs ?? []) as Message[],
    otherUser: profile
      ? {
          id: (profile as { id: string }).id,
          username: (profile as { username: string | null }).username,
          avatar_url: (profile as { avatar_url: string | null }).avatar_url,
        }
      : null,
    listingStickerCode:
      (listingRes.data as { sticker: { code: string } | null } | null)?.sticker
        ?.code ?? null,
  };
}

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
  photo_url: string | null;
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
      id, user_id, sticker_id, type, price_cop, status, created_at, photo_url,
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
    photo_url: string | null;
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
    photo_url: row.photo_url,
    sticker: row.sticker,
    username: usernames.get(row.user_id) ?? null,
  }));
}
