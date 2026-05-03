/**
 * Anti-PII detector for chat messages.
 * Flags phone numbers and email addresses so we can keep all
 * communication on-platform. The detector is intentionally generous
 * about matching — false positives in chat are a much smaller cost
 * than letting a phone number leak.
 */

// Email — practical pattern, not RFC 5321. Matches "name@host.tld"
// and obfuscations like "name (at) host (dot) tld" / "name [at] host".
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const EMAIL_OBFUSCATED_RE =
  /\b[a-z0-9._%+-]+\s*[\(\[\{]?\s*(?:at|arroba|@)\s*[\)\]\}]?\s*[a-z0-9.-]+\s*[\(\[\{]?\s*(?:dot|punto|\.)\s*[\)\]\}]?\s*[a-z]{2,}\b/i;

/**
 * Returns true if the body contains 7+ digits in a "phone-shaped"
 * arrangement: digits with optional separators (spaces, dashes, dots,
 * parentheses, plus signs). 7 digits is the minimum for a Colombian
 * landline. We reject anything that looks like one because we have no
 * legitimate reason to share long digit runs in chat.
 */
export function containsPhone(text: string): boolean {
  // Strip everything except digits and common phone punctuation, then
  // count digits in the residual string. If we kept ≥ 7 digits and the
  // longest unbroken digit cluster is ≥ 5, treat as a phone number.
  const phonish = text.replace(/[^\d+\s().\-]/g, " ");
  const digits = phonish.replace(/\D/g, "");
  if (digits.length < 7) return false;

  const longestRun = (phonish.match(/\d+/g) ?? [])
    .map((s) => s.length)
    .reduce((m, n) => Math.max(m, n), 0);

  return longestRun >= 5 || digits.length >= 10;
}

export function containsEmail(text: string): boolean {
  return EMAIL_RE.test(text) || EMAIL_OBFUSCATED_RE.test(text);
}

export type PiiHit = "phone" | "email";

export function detectPii(text: string): PiiHit | null {
  if (containsPhone(text)) return "phone";
  if (containsEmail(text)) return "email";
  return null;
}
