# Setup, the parts Claude cannot do

Three things need a logged-in browser session. Everything downstream of them is
written and waiting.

## 1. LinkedIn app

1. https://www.linkedin.com/developers/apps/new
2. Associate it with a LinkedIn Page you admin. Verify it from the Settings tab.
3. Products tab: add **Sign In with LinkedIn using OpenID Connect** and
   **Share on LinkedIn**. Both are self-serve, no approval queue.
4. Auth tab: add the redirect URLs. They must be HTTPS. `http://localhost` is
   rejected, which is why the deploy comes first. Add both. The app derives the
   redirect URI from the host you opened, so either works, and the second one
   keeps you moving if the goodsocials.co certificate is still provisioning.
   ```
   https://goodsocials.co/api/linkedin/callback
   https://goodsocials.vercel.app/api/linkedin/callback
   ```
5. Copy the Client ID and Client Secret.

## 2. Vercel project

Done. `goodsocials.co` on the Kucherbaev Services (Pro) team, linked to
`pavelk2/goodsocials`, deploying on push. `goodsocials.vercel.app` is the
Vercel alias and works as a fallback.

One thing left: the Vercel MCP integration cannot see this project, so Claude
cannot read build logs or runtime errors for it. Add `goodsocials` to the
integration's project access list next to `timetuna` and `goodlads`.

Use a **public production host** for anything LinkedIn redirects to, meaning
`goodsocials.co` or `goodsocials.vercel.app`. The per-deployment URL
(`goodsocials-timetuna.vercel.app`) sits behind Vercel Authentication and will
bounce LinkedIn's redirect to a login page. Do not turn protection off, use a
production host.

## 3. Neon database

1. Create a Neon project, one database.
2. Copy the pooled and unpooled connection strings.

## 4. Environment variables on Vercel

Set these for Preview and Production. Names and purposes are in CLAUDE.md.

```
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_API_VERSION        202606
LINKEDIN_DEBUG_SECRET       any random string, used as ?k= on the debug routes
AUTH_URL                    https://goodsocials.co
DATABASE_URL
DATABASE_URL_UNPOOLED
```

`LINKEDIN_API_VERSION` is pinned. Confirm 202606 is still in the portal's
version list. If it is not, use the oldest version the portal still offers, and
put the expiry date somewhere you will see it.

## 5. The two clicks that finish Day 1

Open these in order, with your own `LINKEDIN_DEBUG_SECRET` as `k`. If
goodsocials.co is not serving yet, swap the host for goodsocials.vercel.app.
The redirect URI follows whichever host you open, so it stays consistent.

```
https://goodsocials.co/api/linkedin/start?k=SECRET
```
Consents to all four scopes once, exchanges the code, reads your member id, and
publishes one hardcoded post to your feed. The page reports the scopes granted,
the token lifetime, whether a refresh token came back, and the post URN, then
links to the live post. Your access token is never rendered or logged.

```
https://goodsocials.co/api/linkedin/start?k=SECRET&probe=1
```
The isolated `offline_access` test. It is isolated because an ungranted scope
fails the whole authorization request rather than degrading, which would take
the working run down with it. It does not post. Send the page back and the
answer goes into CLAUDE.md.

Then delete the test post from LinkedIn, or:
```
LINKEDIN_ACCESS_TOKEN=... npx tsx scripts/linkedin-post.ts --delete urn:li:share:...
```

Both debug routes get deleted once Auth.js owns the flow.


---

# Finishing Day 1: database and sign in

Everything below is on Vercel, no code changes needed.

## 1. One more redirect URL in the LinkedIn app

Auth.js uses its own callback path, separate from the Day 1 debug route. Add it
alongside the two already there, or sign in fails with a redirect_uri mismatch.

```
https://goodsocials.co/api/auth/callback/linkedin
```

## 2. Three more environment variables on Vercel

```
AUTH_URL                https://goodsocials.co
AUTH_SECRET             openssl rand -base64 32
TOKEN_ENCRYPTION_KEY    openssl rand -base64 32
```

`TOKEN_ENCRYPTION_KEY` must decode to exactly 32 bytes. `openssl rand -base64 32`
gives that. The app refuses to start the crypto module with anything else rather
than silently encrypting with a weak key.

Losing this key makes every stored LinkedIn token unreadable, which means every
connected member has to re-authorize. Put it somewhere you will still have it in
six months.

Redeploy after saving. Environment variables do not reach deployments that
already exist.

## 3. Create the tables

```
https://goodsocials.co/api/admin/migrate?k=YOURSECRET
```

Applies `db/migrations/*.sql` using the deployment's own `DATABASE_URL`, so the
connection string never leaves Vercel. Re-running it is safe. It lists every
table it finds when it is done. Expect 9.

## 4. Sign in

```
https://goodsocials.co/api/auth/signin
```

One consent for all four scopes. On success the app writes an `account`, a
`profile`, an encrypted `linkedin_connection`, a `board`, and three placeholder
brand principles, then `https://goodsocials.co/board` renders five columns.

Sign in again and nothing duplicates. The same path handles day 60
re-authorization: same rows, fresh token, status back to active.

The `/api/admin/migrate` and `/api/linkedin/*` routes are Day 1 scaffolding and
get deleted once this is signed off.
