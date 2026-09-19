import { openSecret, sealSecret, type SealedSecret } from "@/lib/crypto";

/**
 * The only file that touches a raw LinkedIn access token. The cipher itself is
 * lib/crypto.ts, shared with the one other thing in the product that holds a
 * secret at rest, so there is one AES-256-GCM implementation rather than two
 * that drift.
 *
 * No token is logged, no token crosses into client-side code, and no other
 * module imports these to move a token somewhere else.
 */

export type SealedToken = SealedSecret;

export function sealToken(plaintext: string): SealedToken {
  return sealSecret(plaintext);
}

export function openToken(sealed: SealedToken): string {
  return openSecret(sealed);
}
