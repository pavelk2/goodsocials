import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * The only file that touches a raw LinkedIn access token. AES-256-GCM, a fresh
 * random IV per record, the IV and auth tag stored alongside the ciphertext.
 *
 * No token is logged, no token crosses into client-side code, and no other
 * module imports these functions to move a token somewhere else.
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

export type SealedToken = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export function sealToken(plaintext: string): SealedToken {
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

export function openToken(sealed: SealedToken): string {
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
