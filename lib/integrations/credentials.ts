import { openSecret, sealSecret, type SealedSecret } from "@/lib/crypto";
import type { source } from "@/db/schema";

/**
 * The only file that touches a raw source credential, the way
 * lib/linkedin/crypto.ts is the only one that touches a LinkedIn token. Same
 * cipher, same key, same rules: nothing logged, nothing sent to the client,
 * and no other module imports these to move a credential somewhere else.
 */

export type SealedCredential = {
  credentialCiphertext: string;
  credentialIv: string;
  credentialTag: string;
};

export function sealCredential(plaintext: string): SealedCredential {
  const sealed = sealSecret(plaintext);
  return {
    credentialCiphertext: sealed.ciphertext,
    credentialIv: sealed.iv,
    credentialTag: sealed.tag,
  };
}

export function openCredential(row: typeof source.$inferSelect): string {
  const sealed: SealedSecret = {
    ciphertext: row.credentialCiphertext,
    iv: row.credentialIv,
    tag: row.credentialTag,
  };
  return openSecret(sealed);
}
