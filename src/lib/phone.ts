import { parsePhoneNumberFromString } from "libphonenumber-js/mobile";

/**
 * Colombian mobile phone validation — Layer 1.
 *
 * Uses libphonenumber-js's MOBILE-only metadata bundle, so landlines
 * (601 Bogotá, 604 Medellín, etc.) fail `isValid()` outright instead
 * of needing a separate type check. On top of that we layer a small
 * "anti-fake" heuristic that catches the obvious nonsense (3000000000,
 * 3001234567) that's technically a valid range but never a real human.
 *
 * This does NOT prove ownership — for that we need the OTP layer
 * (Twilio Verify or WhatsApp Business). It only filters bad numbers
 * before they reach the database.
 */

const COL_REGION = "CO" as const;

export type PhoneValidation =
  | { ok: true; e164: string; national: string; digits: string }
  | { ok: false; reason: "format" | "not_mobile" | "fake" };

export function validateColombianMobile(input: string): PhoneValidation {
  const cleaned = input.trim();
  if (!cleaned) return { ok: false, reason: "format" };

  const parsed = parsePhoneNumberFromString(cleaned, COL_REGION);

  // The /mobile bundle treats landlines as INVALID, so we have to
  // disambiguate: if there are exactly 10 digits and they don't start
  // with 3, the user typed a fixed-line number — surface that as
  // "not_mobile" so the error message can tell them WhatsApp won't
  // work on landlines, instead of a generic "format" complaint.
  if (!parsed || !parsed.isValid()) {
    const digitsOnly = cleaned.replace(/\D/g, "");
    const national = digitsOnly.startsWith("57") && digitsOnly.length === 12
      ? digitsOnly.slice(2)
      : digitsOnly;
    if (national.length === 10 && /^[1-9]/.test(national) && !national.startsWith("3")) {
      return { ok: false, reason: "not_mobile" };
    }
    return { ok: false, reason: "format" };
  }
  if (parsed.country !== COL_REGION) return { ok: false, reason: "format" };

  const national = parsed.nationalNumber.toString();
  if (national.length !== 10 || !national.startsWith("3")) {
    return { ok: false, reason: "not_mobile" };
  }

  if (looksFake(national)) return { ok: false, reason: "fake" };

  return {
    ok: true,
    e164: parsed.number, // "+573001234567"
    national, // "3001234567"
    digits: parsed.number.replace(/\D/g, ""), // "573001234567"
  };
}

/**
 * Heuristic blocklist for numbers that are structurally valid but
 * obviously not real: all-same digit, ≥6-digit sequential runs anywhere
 * in the number, and the canonical "3000000000" placeholders that get
 * typed when someone is clearly faking a form.
 */
function looksFake(national: string): boolean {
  // 7+ identical digits anywhere — 3000000000, 3111111111, …
  if (/(\d)\1{6,}/.test(national)) return true;

  // Common test/placeholder prefix.
  if (/^3000000\d{3}$/.test(national)) return true;

  // Any 6+ character ascending or descending digit run, not just at
  // the tail. Catches 3001234567 (123456) and 3009876543 (987654).
  if (hasSequentialRun(national, 6)) return true;

  return false;
}

function hasSequentialRun(digits: string, minLen: number): boolean {
  if (digits.length < minLen) return false;
  let asc = 1;
  let desc = 1;
  for (let i = 1; i < digits.length; i++) {
    const diff = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
    if (diff === 1) {
      asc++;
      desc = 1;
    } else if (diff === -1) {
      desc++;
      asc = 1;
    } else {
      asc = 1;
      desc = 1;
    }
    if (asc >= minLen || desc >= minLen) return true;
  }
  return false;
}
