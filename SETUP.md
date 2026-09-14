# Setup, the parts Claude cannot do

Three things need a logged-in browser session. Everything downstream of them is
written and waiting.

## 1. LinkedIn app

1. https://www.linkedin.com/developers/apps/new
2. Associate it with a LinkedIn Page you admin. Verify it from the Settings tab.
3. Products tab: add **Sign In with LinkedIn using OpenID Connect** and
   **Share on LinkedIn**. Both are self-serve, no approval queue.
4. Auth tab: add the redirect URL. It must be HTTPS. `http://localhost` is
   rejected, which is why the deploy comes first.
   ```
   https://<the vercel url>/api/linkedin/callback
   ```
5. Copy the Client ID and Client Secret.

## 2. Vercel project

The MCP integration created a project id it cannot read back, then returned 403
on deploy, so this needs the dashboard.

1. Check https://vercel.com/timetuna for an existing `goodsocials` project
   before creating one. A half-created project may already be there.
2. Connect it to `pavelk2/goodsocials`, or import the repo fresh.
3. Put it on the **Kucherbaev Services** (Pro) team, not Hobby. Hobby cron
   cannot run more than once a day, and the publisher needs minute granularity.
4. Settings, Deployment Protection: turn **Vercel Authentication off for
   preview deployments**. LinkedIn's redirect cannot get through a login wall.

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
DATABASE_URL
DATABASE_URL_UNPOOLED
```

`LINKEDIN_API_VERSION` is pinned. Confirm 202606 is still in the portal's
version list. If it is not, use the oldest version the portal still offers, and
put the expiry date somewhere you will see it.

## 5. The two clicks that finish Day 1

Open these in order, on the deployed URL, with your own `LINKEDIN_DEBUG_SECRET`
as `k`.

```
https://<vercel url>/api/linkedin/start?k=SECRET
```
Consents to all four scopes once, exchanges the code, reads your member id, and
publishes one hardcoded post to your feed. The page reports the scopes granted,
the token lifetime, whether a refresh token came back, and the post URN, then
links to the live post. Your access token is never rendered or logged.

```
https://<vercel url>/api/linkedin/start?k=SECRET&probe=1
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
