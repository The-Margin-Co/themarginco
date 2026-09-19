import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * /og renders an image per unique title, so an open endpoint is both a cost-DoS target and a way
 * to put arbitrary words on a branded card hosted at our own domain. Every link we emit is signed;
 * the route rejects anything else. Without a secret (local dev) signing is skipped.
 */
function secret() {
  return process.env.OG_SIGNING_SECRET || null;
}

export function signOgTitle(title: string) {
  const key = secret();
  return key ? createHmac("sha256", key).update(title).digest("base64url").slice(0, 24) : null;
}

export function verifyOgTitle(title: string, signature: string | null) {
  const expected = signOgTitle(title);
  if (expected === null) return true; // no secret configured: dev/preview convenience
  if (!signature || signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
