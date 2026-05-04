import { createHash, createHmac } from "node:crypto";

/**
 * Wompi (Colombian payment gateway) integration helpers.
 *
 * mefaltauna uses Wompi's Web Checkout: we redirect the user to a
 * Wompi-hosted page with a signed query string, the user pays there,
 * and Wompi POSTs an event back to /api/wompi/webhook with the final
 * status. We never see card data.
 *
 * Required env vars (set in Vercel + .env.local):
 *   - WOMPI_PUBLIC_KEY         pub_test_xxx or pub_prod_xxx
 *   - WOMPI_INTEGRITY_SECRET   used to sign Web Checkout query
 *   - WOMPI_EVENTS_SECRET      used to verify webhook signatures
 *   - WOMPI_ENV                'sandbox' | 'production' (default: sandbox)
 */

export type WompiEnvName = "sandbox" | "production";

export type WompiConfig = {
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
  env: WompiEnvName;
  /** Web Checkout host. */
  checkoutBase: string;
};

export function getWompiConfig(): WompiConfig | null {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!publicKey || !integritySecret || !eventsSecret) return null;

  // sandbox → wompi.uat tenant, production → wompi.co. Both use the
  // same checkout host — only the API host differs (we don't hit the
  // API server-side yet, only the webhook comes in).
  const env: WompiEnvName =
    (process.env.WOMPI_ENV as WompiEnvName) === "production"
      ? "production"
      : "sandbox";

  return {
    publicKey,
    integritySecret,
    eventsSecret,
    env,
    checkoutBase: "https://checkout.wompi.co/p/",
  };
}

/**
 * Cents amount for the one-time pass. Single source of truth so the
 * widget, webhook validation, and the UI all agree.
 */
export const PASS_PRICE_COP_CENTS = 990_000; // $9.900 COP
export const PASS_PRICE_COP = 9_900;

/**
 * Generates a unique reference string we hand to Wompi at checkout
 * time. Format: `mfu_<userId>_<random>` so support can locate the
 * user from the reference without an extra DB hop.
 */
export function buildWompiReference(userId: string): string {
  const rand = cryptoRandomString(12);
  return `mfu_${userId.replace(/-/g, "").slice(0, 12)}_${rand}`;
}

function cryptoRandomString(length: number): string {
  // Avoid Node's randomBytes here so this stays usable in edge runtimes.
  const arr = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => (b % 36).toString(36))
    .join("");
}

/**
 * Wompi Web Checkout integrity signature.
 *   sha256(reference + amountInCents + currency + integritySecret)
 * Without it the checkout page rejects the request.
 */
export function buildIntegritySignature(args: {
  reference: string;
  amountInCents: number;
  currency: string;
  integritySecret: string;
}): string {
  const concat = `${args.reference}${args.amountInCents}${args.currency}${args.integritySecret}`;
  return createHash("sha256").update(concat).digest("hex");
}

/**
 * Builds the full Web Checkout URL with all required params. The
 * caller redirects the user there. After payment Wompi redirects
 * back to `redirectUrl`.
 */
export function buildCheckoutUrl(args: {
  config: WompiConfig;
  reference: string;
  amountInCents: number;
  currency?: string;
  redirectUrl: string;
  customerEmail?: string;
}): string {
  const currency = args.currency ?? "COP";
  const signature = buildIntegritySignature({
    reference: args.reference,
    amountInCents: args.amountInCents,
    currency,
    integritySecret: args.config.integritySecret,
  });

  const params = new URLSearchParams({
    "public-key": args.config.publicKey,
    currency,
    "amount-in-cents": String(args.amountInCents),
    reference: args.reference,
    "signature:integrity": signature,
    "redirect-url": args.redirectUrl,
  });
  if (args.customerEmail) {
    params.set("customer-data:email", args.customerEmail);
  }

  return `${args.config.checkoutBase}?${params.toString()}`;
}

/**
 * Webhook signature verification.
 *
 * Wompi sends a POST whose body is JSON like:
 *   {
 *     "event": "transaction.updated",
 *     "data": { "transaction": { ... } },
 *     "sent_at": "...",
 *     "timestamp": 1716...,
 *     "signature": {
 *       "checksum": "...",
 *       "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
 *     },
 *     "environment": "test" | "prod"
 *   }
 *
 * The checksum is sha256 of:
 *   <concat of property values>{timestamp}{events_secret}
 */
export type WompiWebhookEnvelope = {
  event: string;
  data: { transaction?: WompiTransaction };
  timestamp: number;
  signature: { checksum: string; properties: string[] };
  environment?: string;
};

export type WompiTransaction = {
  id: string;
  reference: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  amount_in_cents: number;
  currency: string;
  customer_email?: string;
  payment_method_type?: string;
};

export function verifyWebhookSignature(
  payload: WompiWebhookEnvelope,
  eventsSecret: string,
): boolean {
  if (!payload?.signature?.checksum || !payload?.signature?.properties) {
    return false;
  }
  const concat =
    payload.signature.properties
      .map((path) => readPath(payload.data, path) ?? "")
      .join("") +
    String(payload.timestamp) +
    eventsSecret;

  const expected = createHash("sha256").update(concat).digest("hex");

  // Constant-time compare via HMAC trick: we hash both with the same
  // key and compare the resulting digests, so a timing oracle on the
  // string compare doesn't leak position information.
  const got = createHmac("sha256", eventsSecret)
    .update(payload.signature.checksum)
    .digest("hex");
  const want = createHmac("sha256", eventsSecret)
    .update(expected)
    .digest("hex");
  return got === want;
}

function readPath(obj: unknown, path: string): string | number | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  if (typeof cur === "string" || typeof cur === "number") return cur;
  return undefined;
}
