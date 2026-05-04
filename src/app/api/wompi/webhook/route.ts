import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getWompiConfig,
  verifyWebhookSignature,
  type WompiWebhookEnvelope,
} from "@/lib/wompi";

/**
 * Wompi webhook. Wompi POSTs `transaction.updated` events here every
 * time a payment changes state. We:
 *   1. Verify the HMAC signature with our events secret.
 *   2. Hand the event to apply_wompi_payment() which idempotently
 *      updates the payments row and flips the user's is_member flag
 *      when the status hits APPROVED.
 *
 * Always responds 200 — Wompi retries on non-2xx, and after the row
 * is updated we don't want them retrying just because the response
 * shape was off. Errors get logged for debugging.
 */
export async function POST(req: NextRequest) {
  const config = getWompiConfig();
  if (!config) {
    console.warn("[wompi-webhook] config not loaded");
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  let payload: WompiWebhookEnvelope;
  try {
    payload = (await req.json()) as WompiWebhookEnvelope;
  } catch (err) {
    console.warn("[wompi-webhook] invalid json", err);
    return NextResponse.json({ ok: false, reason: "invalid_json" });
  }

  if (!verifyWebhookSignature(payload, config.eventsSecret)) {
    console.warn("[wompi-webhook] signature mismatch", {
      event: payload.event,
      ref: payload?.data?.transaction?.reference,
    });
    return NextResponse.json({ ok: false, reason: "bad_signature" });
  }

  const tx = payload.data?.transaction;
  if (!tx?.reference) {
    return NextResponse.json({ ok: false, reason: "missing_transaction" });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.warn("[wompi-webhook] admin client unavailable");
    return NextResponse.json({ ok: false, reason: "admin_unavailable" });
  }

  const { error } = await admin.rpc("apply_wompi_payment", {
    p_reference: tx.reference,
    p_transaction_id: tx.id,
    p_status: tx.status,
    p_amount_cop: Math.floor((tx.amount_in_cents ?? 0) / 100),
    p_event: payload as unknown as Record<string, unknown>,
  });

  if (error) {
    console.error("[wompi-webhook] apply_wompi_payment failed", {
      ref: tx.reference,
      status: tx.status,
      message: error.message,
    });
    // Still respond 200 — Wompi retries indefinitely on non-2xx, and
    // the same retry will hit the same error. We surface this to the
    // operator via logs instead.
  }

  return NextResponse.json({ ok: true });
}

// Allow GET for the health-check Wompi sometimes runs against the URL.
export async function GET() {
  return NextResponse.json({ ok: true });
}
