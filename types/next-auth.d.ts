import "next-auth";

declare module "next-auth" {
  interface Session {
    /** LinkedIn OIDC sub. Keys every profile lookup. */
    memberId?: string;
  }
}
