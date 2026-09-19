import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM under TOKEN_ENCRYPTION_KEY: a fresh random IV per record, the IV
 * and the auth tag stored beside the ciphertext. The primitive only, with no
 * opinion about what is being sealed.
 *
 * This was lib/linkedin/crypto.ts alone until read integrations arrived with a
 * second class of secret to hold. A Stripe restricted key is not a LinkedIn
 * token and does not belong in that module, and a second copy of a cipher is
 * how one of the two ends up with a reused IV. So the cipher moved down here
 * and the two callers above it stayed:
 *
 * - lib/linkedin/crypto.ts holds the only functions that touch a LinkedIn token.
 * - lib/integrations/credentials.ts holds the only ones that touch a source
 *   credential.
 *
 * Nothing else calls this file. Neither caller logs a plaintext and neither
 * crosses into client-side code.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function key(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("Missing environment variable: TOKEN_ENCRYPTION_KEY");
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length !== 32) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be 32 bytes base64, got ${bytes.length}`,
    );
  }
  return bytes;
}

export type SealedSecret = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export function sealSecret(plaintext: string): SealedSecret {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function openSecret(sealed: SealedSecret): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    key(),
    Buffer.from(sealed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
