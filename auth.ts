import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { LINKEDIN_SCOPES } from "@/lib/linkedin/config";
import { onboardMember } from "@/lib/onboarding";

/**
 * Auth.js owns the consent and the code exchange. We own the token.
 *
 * No database adapter on purpose. Auth.js session tables would collide with
 * our `account` table, which means something different here, and a 60 day
 * token with no refresh is a lifecycle Auth.js has no concept of. Sessions are
 * JWTs, and the LinkedIn token lives encrypted in `linkedin_connection` where
 * the expiry monitor can see it.
 *
 * Scopes come from LINKEDIN_SCOPES and nowhere else. An unlisted scope does not
 * return an error to our callback, it serves LinkedIn's own error page and
 * bounces the member to the bare domain, so a typo here is invisible in logs.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: { params: { scope: LINKEDIN_SCOPES.join(" ") } },
    }),
  ],
  session: { strategy: "jwt" },
  // Our own page. The Auth.js default is an unbranded button naming a major
  // platform, which is what Safe Browsing flagged as social engineering.
  pages: { signIn: "/signin", error: "/auth-error" },
  callbacks: {
    async signIn({ account, profile }) {
      if (!account?.access_token || !profile?.sub) {
        console.error(
          "[signIn] LinkedIn returned no access token or no sub, refusing",
        );
        return false;
      }
      try {
        await onboardMember({
          memberId: profile.sub,
          name: profile.name,
          email: profile.email,
          avatarUrl:
            typeof profile.picture === "string" ? profile.picture : null,
          accessToken: account.access_token,
          expiresAt:
            account.expires_at ?? Math.floor(Date.now() / 1000) + 60 * 24 * 3600,
          scopes: account.scope ?? LINKEDIN_SCOPES.join(","),
        });
      } catch (cause) {
        // Auth.js turns any throw here into a bare AccessDenied, which is the
        // same code a member declining consent produces. Name the real cause
        // once, loudly, so the log says what to do rather than what happened.
        const message = cause instanceof Error ? cause.message : String(cause);
        if (/relation .* does not exist|42P01/.test(message)) {
          console.error(
            "[signIn] the database has no tables. Run /api/admin/migrate before signing in.",
            message,
          );
        } else {
          console.error("[signIn] could not create the account:", message);
        }
        return false;
      }
      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.sub) token.memberId = profile.sub;
      return token;
    },
    async session({ session, token }) {
      if (typeof token.memberId === "string") {
        session.memberId = token.memberId;
      }
      return session;
    },
  },
});
