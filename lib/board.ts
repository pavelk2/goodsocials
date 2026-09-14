/**
 * Board vocabulary, shared by the components and later by the Drizzle schema.
 * `card_state` in the database is this union. Rejected cards have a state but
 * no column: they leave the board.
 */
export type CardState =
  | "idea"
  | "draft"
  | "image"
  | "scheduled"
  | "posted"
  | "rejected";

/** The five columns, in order. Rejected is deliberately not one of them. */
export const COLUMNS = [
  "idea",
  "draft",
  "image",
  "scheduled",
  "posted",
] as const satisfies readonly CardState[];

/** Exactly three per profile, keyed by kind. A revise comment updates one. */
export type PrincipleKind = "voice" | "visual" | "format";
