import type { SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────
// Types — kept in sync with the SQL schema in supabase/migrations.
// Will be replaced by `supabase gen types typescript` later.
// ────────────────────────────────────────────────────────────

export type StickerType =
  | "player"
  | "badge"
  | "team_photo"
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
  neighborhood: string | null;
  national_id_photo_path: string | null;
};

export async function fetchOwnContact(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileContact | null> {
  const { data, error } = await supabase
    .from("profile_contact")
    .select(
      "user_id, first_name, last_name, national_id, whatsapp, city, neighborhood, national_id_photo_path",
    )
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
  other_display_name: string | null;
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
      "id, user_a, user_b, listing_id, last_message_at, last_read_at_a, last_read_at_b, archived_at_a, archived_at_b",
    )
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(60);
  if (error || !convs) return [];

  // Hide threads the current user has archived. The other side keeps
  // theirs untouched.
  const visible = convs.filter((c) => {
    const archived =
      c.user_a === userId ? c.archived_at_a : c.archived_at_b;
    return archived == null;
  });
  if (visible.length === 0) return [];

  const otherIds = [
    ...new Set(
      visible.map((c) => (c.user_a === userId ? c.user_b : c.user_a) as string),
    ),
  ];
  const listingIds = [
    ...new Set(visible.map((c) => c.listing_id).filter(Boolean) as string[]),
  ];
  const conversationIds = visible.map((c) => c.id);

  const [profilesRes, listingsRes, lastMessagesRes] = await Promise.all([
    otherIds.length
      ? supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", otherIds)
      : Promise.resolve({
          data: [] as Array<{
            id: string;
            username: string | null;
            display_name: string | null;
            avatar_url: string | null;
          }>,
        }),
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
    {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    }
  >();
  for (const p of (profilesRes.data ?? []) as Array<{
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }>) {
    profileMap.set(p.id, {
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
    });
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
    for (const c of visible) {
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

  return visible.map((c) => {
    const other = c.user_a === userId ? c.user_b : c.user_a;
    const p = profileMap.get(other);
    return {
      id: c.id as string,
      other_user_id: other as string,
      other_username: p?.username ?? null,
      other_display_name: p?.display_name ?? null,
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

export type ActiveTrade = {
  id: string;
  status: "pending" | "completed";
  qr_token: string | null;
  seller_id: string;
  buyer_id: string;
  /** Whether the current user has already submitted their rating
   *  for this trade. Always false when status is `pending`. */
  rated_by_me: boolean;
};

export type ConversationListingPreview = {
  code: string;
  name: string;
  team_code: string | null;
  type: StickerType;
  number: number | null;
  /** Optional photo URL the seller attached when publishing. */
  photo_url: string | null;
  /** Sale price in COP, when the listing has one. */
  price_cop: number | null;
};

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
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  /** When the conversation was started from a listing, this is the
   *  listing owner's user_id — used by the trade flow to know who is
   *  the seller vs the buyer. */
  sellerId: string | null;
  listingStickerCode: string | null;
  /** Full sticker preview for the listing this chat is about, when
   *  there is one — used to render the trade card at the top of the
   *  chat. */
  listingPreview: ConversationListingPreview | null;
  /** Most recent pending or just-completed-and-not-fully-rated trade
   *  for this conversation, if any. */
  activeTrade: ActiveTrade | null;
  /** The OTHER party's last_read_at on this conversation. Used by
   *  ChatRoom to render read receipts (✓✓) on the user's outgoing
   *  messages whose created_at is older than this timestamp. */
  lastReadAtOther: string | null;
} | null> {
  const { data: conv } = await supabase
    .from("conversations")
    .select(
      "id, user_a, user_b, listing_id, last_message_at, created_at, last_read_at_a, last_read_at_b",
    )
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return null;
  if (conv.user_a !== userId && conv.user_b !== userId) return null;
  // Other party's last_read_at — used by the UI to render ✓✓ on
  // outgoing messages whose created_at predates it.
  const lastReadAtOther =
    (conv.user_a === userId
      ? (conv.last_read_at_b as string | null)
      : (conv.last_read_at_a as string | null)) ?? null;

  const otherId = conv.user_a === userId ? conv.user_b : conv.user_a;

  const [{ data: msgs }, { data: profile }, listingRes, tradesRes] =
    await Promise.all([
      supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200),
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("id", otherId)
        .maybeSingle(),
      conv.listing_id
        ? supabase
            .from("listings")
            .select(
              "id, user_id, photo_url, price_cop, sticker:sticker_catalog!listings_sticker_id_fkey(code, name, team_code, type, number)",
            )
            .eq("id", conv.listing_id)
            .maybeSingle()
        : Promise.resolve({
            data: null as
              | {
                  id: string;
                  user_id: string;
                  photo_url: string | null;
                  price_cop: number | null;
                  sticker: ConversationListingPreview | null;
                }
              | null,
          }),
      // Most recent trade for this conversation. RLS ensures we only
      // see trades where we are seller or buyer.
      supabase
        .from("trades")
        .select("id, status, qr_token, seller_id, buyer_id")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const listing = listingRes.data as
    | {
        id: string;
        user_id: string;
        photo_url: string | null;
        price_cop: number | null;
        sticker: ConversationListingPreview | null;
      }
    | null;

  let activeTrade: ActiveTrade | null = null;
  const tradeRow = tradesRes.data as
    | {
        id: string;
        status: "pending" | "completed" | "cancelled" | "expired";
        qr_token: string;
        seller_id: string;
        buyer_id: string;
      }
    | null;
  if (
    tradeRow &&
    (tradeRow.status === "pending" || tradeRow.status === "completed")
  ) {
    let ratedByMe = false;
    if (tradeRow.status === "completed") {
      const { data: rating } = await supabase
        .from("trade_ratings")
        .select("id")
        .eq("trade_id", tradeRow.id)
        .eq("rater_id", userId)
        .maybeSingle();
      ratedByMe = Boolean(rating);
    }
    activeTrade = {
      id: tradeRow.id,
      status: tradeRow.status,
      // Hide the QR token from the buyer — only the seller renders
      // it. This keeps the secret out of the buyer's RSC payload.
      qr_token:
        tradeRow.seller_id === userId ? tradeRow.qr_token : null,
      seller_id: tradeRow.seller_id,
      buyer_id: tradeRow.buyer_id,
      rated_by_me: ratedByMe,
    };
  }

  return {
    conversation: conv as Conversation,
    messages: (msgs ?? []) as Message[],
    otherUser: profile
      ? {
          id: (profile as { id: string }).id,
          username: (profile as { username: string | null }).username,
          display_name: (profile as { display_name: string | null })
            .display_name,
          avatar_url: (profile as { avatar_url: string | null }).avatar_url,
        }
      : null,
    sellerId: listing?.user_id ?? null,
    listingStickerCode: listing?.sticker?.code ?? null,
    listingPreview: listing?.sticker
      ? {
          ...listing.sticker,
          photo_url: listing.photo_url,
          price_cop: listing.price_cop,
        }
      : null,
    activeTrade,
    lastReadAtOther,
  };
}

export type TradeListingItem = {
  id: string;
  sticker: ConversationListingPreview;
};

/**
 * The seller's active listings, with sticker preview info, used by
 * the trade-controls picker so the seller can bundle multiple stickers
 * into a single trade. Sorted by sticker number for steady ordering.
 */
export async function fetchSellerActiveListings(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<TradeListingItem[]> {
  const { data } = await supabase
    .from("listings")
    .select(
      "id, photo_url, price_cop, sticker:sticker_catalog!listings_sticker_id_fkey(code, name, team_code, type, number)",
    )
    .eq("user_id", sellerId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    photo_url: string | null;
    price_cop: number | null;
    sticker: {
      code: string;
      name: string;
      team_code: string | null;
      type: StickerType;
      number: number | null;
    } | null;
  }>;
  return rows
    .filter((r) => r.sticker !== null)
    .map((r) => ({
      id: r.id,
      sticker: {
        code: r.sticker!.code,
        name: r.sticker!.name,
        team_code: r.sticker!.team_code,
        type: r.sticker!.type,
        number: r.sticker!.number,
        photo_url: r.photo_url,
        price_cop: r.price_cop,
      },
    }));
}

/**
 * Listings bundled into a trade. Returned with full sticker preview
 * info so the chat can render "Compra acordada por estas N láminas: …".
 * RLS only lets the trade's seller or buyer read these rows.
 */
export async function fetchTradeItems(
  supabase: SupabaseClient,
  tradeId: string,
): Promise<TradeListingItem[]> {
  const { data: items } = await supabase
    .from("trade_items")
    .select("listing_id")
    .eq("trade_id", tradeId);
  const ids = (items ?? []).map((r) => r.listing_id as string);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("listings")
    .select(
      "id, photo_url, price_cop, sticker:sticker_catalog!listings_sticker_id_fkey(code, name, team_code, type, number)",
    )
    .in("id", ids);
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    photo_url: string | null;
    price_cop: number | null;
    sticker: {
      code: string;
      name: string;
      team_code: string | null;
      type: StickerType;
      number: number | null;
    } | null;
  }>;
  return rows
    .filter((r) => r.sticker !== null)
    .map((r) => ({
      id: r.id,
      sticker: {
        code: r.sticker!.code,
        name: r.sticker!.name,
        team_code: r.sticker!.team_code,
        type: r.sticker!.type,
        number: r.sticker!.number,
        photo_url: r.photo_url,
        price_cop: r.price_cop,
      },
    }));
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
  display_name: string | null;
  reputation: number;
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
  options: { ownerOnly?: string } = {},
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
  const profileMap = new Map<
    string,
    {
      username: string | null;
      display_name: string | null;
      reputation: number;
    }
  >();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, reputation")
      .in("id", userIds);
    for (const p of (profiles ?? []) as Array<{
      id: string;
      username: string | null;
      display_name: string | null;
      reputation: number | null;
    }>) {
      profileMap.set(p.id, {
        username: p.username,
        display_name: p.display_name,
        reputation: p.reputation ?? 0,
      });
    }
  }

  return rows.map((row) => {
    const p = profileMap.get(row.user_id);
    return {
      id: row.id,
      user_id: row.user_id,
      sticker_id: row.sticker_id,
      type: row.type,
      price_cop: row.price_cop,
      status: row.status,
      created_at: row.created_at,
      photo_url: row.photo_url,
      sticker: row.sticker,
      username: p?.username ?? null,
      display_name: p?.display_name ?? null,
      reputation: p?.reputation ?? 0,
    };
  });
}

/**
 * Single-listing variant of fetchActiveListings, used by the LiveFeed
 * realtime handler to enrich INSERT payloads (which only carry the
 * raw row columns) with sticker + profile info before prepending the
 * card to the feed.
 */
export async function fetchFeedItemById(
  supabase: SupabaseClient,
  id: string,
): Promise<FeedItem | null> {
  const { data } = await supabase
    .from("listings")
    .select(
      `
      id, user_id, sticker_id, type, price_cop, status, created_at, photo_url,
      sticker:sticker_catalog!listings_sticker_id_fkey ( code, name, team_code, type, number )
      `,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    user_id: string;
    sticker_id: number;
    type: ListingType;
    price_cop: number | null;
    status: ListingStatus;
    created_at: string;
    photo_url: string | null;
    sticker: FeedItem["sticker"];
  };
  if (!row.sticker) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, reputation")
    .eq("id", row.user_id)
    .maybeSingle();
  return {
    id: row.id,
    user_id: row.user_id,
    sticker_id: row.sticker_id,
    type: row.type,
    price_cop: row.price_cop,
    status: row.status,
    created_at: row.created_at,
    photo_url: row.photo_url,
    sticker: row.sticker,
    username: profile?.username ?? null,
    display_name: profile?.display_name ?? null,
    reputation: profile?.reputation ?? 0,
  };
}
