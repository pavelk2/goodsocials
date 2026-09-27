# Product Hunt launch kit

Everything the Product Hunt form asks for, and the share cards every network
reads from goodsocials.co. Copy is derived from the offer in CLAUDE.md and the
live landing page. Where the two disagree, the landing page wins, because it is
what a visitor from Product Hunt reads next. Agency is **up to 12 profiles** in
both, read from `AGENCY_SEATS` in `lib/legal.ts`.

## The form

| Field | Limit | Value |
|---|---|---|
| Name | 40 | GoodSocials |
| Tagline | 60 | AI social media manager for LinkedIn |
| Link | | https://goodsocials.co/?ref=producthunt |
| Topics | 3 | Social Media, Marketing, Artificial Intelligence |
| Pricing | | Paid, with a free trial |
| Thumbnail | 240x240 | `public/product-hunt/thumbnail-240.png` |
| Gallery | 1270x760 | `public/product-hunt/gallery-1.png` to `gallery-5.png`, in order |

Tagline alternates, all under 60:
- Writes your LinkedIn posts, you approve, it publishes (52)
- LinkedIn posts from your own data, 5 times a week (49)

Description, 250 of 260:

> GoodSocials writes LinkedIn posts from market research, deep dives and your
> own numbers from Stripe, PostHog or GitHub. You approve each one on a board,
> and it publishes 5 times a week at 09:00 in your timezone. $100 a month per
> profile, 14 days free.

## First comment

The maker's own voice, so first person is right here. It is not a generated
post and the third person rule does not apply to it.

> Hi Product Hunt, I'm Pavel.
>
> Every founder I know has the same LinkedIn problem. They know things worth
> posting and have no hours to write them up, so they post twice in January and
> then nothing until a launch.
>
> GoodSocials is the social media manager for that person. Sign in with
> LinkedIn, paste your website, and 7 posts are on a board in about 90 seconds.
> Each card is Approve, Revise or Reject. Approved posts publish at 09:00 in
> your timezone, 5 times a week.
>
> Two things decide whether it is worth $100 a month:
>
> 1. **Corrections stick.** A comment on one card rewrites it and updates your
>    brand principles, so the same note never has to be given twice.
> 2. **It only writes three kinds of post.** Market research with the source
>    named, deep dives with references, and your own numbers read from Stripe,
>    PostHog, GitHub, Plausible or Notion. No "no one talks about this".
>
> Agencies run up to 12 client profiles for $1,000 a month, and each client
> connects their own LinkedIn, so nobody holds a password.
>
> 14 days free on every plan. I read every comment today, and the hardest
> question gets the first answer.

## Share cards

One picture for every public page, drawn by `npx tsx scripts/share-export.ts`
from the tokens in `app/globals.css`. Never edit the PNGs by hand.

| File | Size | Read by |
|---|---|---|
| `app/opengraph-image.png` | 1200x630 | LinkedIn, Facebook, WhatsApp, Telegram, Slack, Discord, iMessage, Product Hunt |
| `app/twitter-image.png` | 1200x630 | X, as `summary_large_image` |

Titles and descriptions come from `shareMetadata()` in `lib/share.ts`. Every
public page goes through it, so a shared blog post shows the post's title with
the same picture, rather than the homepage card.

The composition is centred because WhatsApp and iMessage cut a square from the
middle for a small preview. The mark and the word LinkedIn survive the cut.

The gallery is the landing page as rendered, framed under a caption. To redraw
it after a landing change:

```
npm run build && npx next start -p 3100
npx tsx scripts/share-export.ts --gallery http://localhost:3100
```

## Launch day checks

Each network caches a card the first time anybody pastes the link, often for
days. Paste the production URL into each of these after the deploy and before
the first share, so the first scrape is the right one.

- **LinkedIn.** https://www.linkedin.com/post-inspector/ with
  `https://goodsocials.co`. Inspecting also refreshes their cache.
- **X.** Compose a post with the link and look at the preview before sending.
  The old card validator is gone.
- **Telegram.** Send the link to `@WebpageBot` to refresh its cache.
- **WhatsApp.** No refresh tool. If an old card is cached, share
  `https://goodsocials.co/?v=2`, which it treats as a new URL.
- **Facebook and Messenger.** https://developers.facebook.com/tools/debug/ and
  press Scrape again.
- **Slack and Discord.** Paste into a private channel. Both scrape on paste.

Also on the morning:

- The Product Hunt badge above the hero points at post id `1260932`
  (`PH_BADGE` in `app/page.tsx`). Check it resolves to the live launch.
- Open the site from a Google search result, since a Safe Browsing re-flag on
  launch morning ends the launch (ROADMAP.md, Pre-launch).
