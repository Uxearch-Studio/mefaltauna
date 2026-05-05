"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server actions for the QR-based trade confirmation flow. Three
 * stages, each backed by a SECURITY DEFINER RPC in the database:
 *
 *   1. startTradeAction()  — seller flips a chat into "Compra
 *      acordada" mode, gets a QR token to render in their UI.
 *   2. confirmTradeAction() — buyer scans the seller's QR in
 *      person; the matched token marks the trade COMPLETED.
 *   3. rateTradeAction()   — either party submits 1–5 stars + an
 *      optional comment about the other party. Updates the rated
 *      user's aggregate reputation immediately.
 */

export type StartTradeState = {
  ok?: true;
  trade?: { id: string; qrToken: string };
  error?:
    | "not_configured"
    | "unauthenticated"
    | "not_participant"
    | "caller_not_seller"
    | "listing_not_found"
    | "no_listings"
    | "db_error";
};

export async function startTradeAction(
  conversationId: string,
  listingIds: string[],
): Promise<StartTradeState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  if (!listingIds.length) return { error: "no_listings" };

  const { data, error } = await supabase
    .rpc("start_trade", {
      p_conversation_id: conversationId,
      p_listing_ids: listingIds,
    })
    .single<{ trade_id: string; qr_token: string }>();

  if (error) {
    const msg = error.message ?? "";
    console.error("[startTradeAction] rpc start_trade failed", {
      conversationId,
      listingIds,
      code: (error as { code?: string }).code,
      message: msg,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
    });
    if (msg.includes("not_participant")) return { error: "not_participant" };
    if (msg.includes("caller_not_seller")) return { error: "caller_not_seller" };
    if (msg.includes("listing_not_found")) return { error: "listing_not_found" };
    if (msg.includes("no_listings")) return { error: "no_listings" };
    return { error: "db_error" };
  }

  revalidatePath(`/[locale]/app/inbox/${conversationId}`, "page");
  return {
    ok: true,
    trade: { id: data.trade_id, qrToken: data.qr_token },
  };
}

export type ConfirmTradeState = {
  ok?: true;
  trade?: {
    id: string;
    conversationId: string;
    sellerId: string;
    buyerId: string;
  };
  error?:
    | "not_configured"
    | "unauthenticated"
    | "token_not_found"
    | "not_buyer"
    | "already_settled"
    | "db_error";
};

export async function confirmTradeAction(
  token: string,
): Promise<ConfirmTradeState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { data, error } = await supabase
    .rpc("confirm_trade", { p_token: token })
    .single<{
      trade_id: string;
      conversation_id: string;
      seller_id: string;
      buyer_id: string;
    }>();

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("token_not_found")) return { error: "token_not_found" };
    if (msg.includes("not_buyer")) return { error: "not_buyer" };
    if (msg.includes("already_settled")) return { error: "already_settled" };
    return { error: "db_error" };
  }

  revalidatePath(`/[locale]/app/inbox/${data.conversation_id}`, "page");
  return {
    ok: true,
    trade: {
      id: data.trade_id,
      conversationId: data.conversation_id,
      sellerId: data.seller_id,
      buyerId: data.buyer_id,
    },
  };
}

export type RateTradeState = {
  ok?: true;
  error?:
    | "not_configured"
    | "unauthenticated"
    | "trade_not_found"
    | "trade_not_completed"
    | "not_party"
    | "invalid_stars"
    | "duplicate"
    | "db_error";
};

export async function rateTradeAction(
  tradeId: string,
  stars: number,
  comment: string,
): Promise<RateTradeState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { error } = await supabase.rpc("rate_trade", {
    p_trade_id: tradeId,
    p_stars: stars,
    p_comment: comment,
  });

  if (error) {
    const msg = error.message ?? "";
    if ((error as { code?: string }).code === "23505") {
      return { error: "duplicate" };
    }
    if (msg.includes("trade_not_found")) return { error: "trade_not_found" };
    if (msg.includes("trade_not_completed"))
      return { error: "trade_not_completed" };
    if (msg.includes("not_party")) return { error: "not_party" };
    if (msg.includes("invalid_stars")) return { error: "invalid_stars" };
    return { error: "db_error" };
  }

  return { ok: true };
}
