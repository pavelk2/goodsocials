import type { Comparison } from "./types";
import { AGENCY_SEATS } from "@/lib/legal";

export const COMPARISONS: Comparison[] = [
  {
    slug: "buffer",
    name: "Buffer",
    site: "buffer.com",
    category: "Scheduler for every network",
    summary:
      "Buffer is one of the clearest, calmest schedulers on the market, with a free plan and per-channel pricing that stays fair for small accounts.",
    verdict:
      "Pick Buffer if you already write your own posts and want them queued across Instagram, Threads, LinkedIn and more for a low monthly cost. Pick GoodSocials if the posts are the problem and you want someone else to write LinkedIn posts you only approve.",
    rows: [
      {
        label: "Built for",
        them: "Creators and small businesses posting to several networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn, Instagram, Facebook, TikTok, Threads, Bluesky, X and more",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with an optional AI assistant for rewrites and ideas",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Drafts and approvals on the team plan",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Queue slots per channel, times you choose",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then paid per connected channel",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You post to three or more networks and want one queue for all of them.",
      "You write your own posts and need a place to schedule them, nothing more.",
      "You want a free plan or a bill that grows one channel at a time.",
    ],
    chooseUs: [
      "LinkedIn is the one network that matters and you have not posted in weeks.",
      "You would rather approve seven finished posts than write one.",
      "You want a correction to stick, so the same mistake does not come back next week.",
    ],
    blocks: [
      { type: "h2", text: "What Buffer does well" },
      {
        type: "p",
        text: "Buffer has been scheduling social posts for over a decade and it shows. The queue is easy to read, connecting a channel takes a minute, and the per-channel pricing means a solo creator with three accounts pays very little. There is a free plan, an AI assistant for rewording and ideas, and a team plan with drafts and approvals. If you have a post in hand and want it out on LinkedIn, Instagram and Threads at sensible times, Buffer is a good home for it.",
      },
      { type: "h2", text: "Where the work starts" },
      {
        type: "p",
        text: "Buffer assumes the post exists. You open the composer, you write, you pick a slot. For most people who stall on LinkedIn, the slot was never the hard part. GoodSocials starts one step earlier. You paste your website URL and the agent writes seven posts across four themes it drew from your site. They land on a board with five columns, and each card has three buttons: Approve, Revise, Reject.",
      },
      {
        type: "p",
        text: "The part Buffer does not try to do is learning from you. When you revise a GoodSocials card with a comment like 'shorter openings, no questions', the card is rewritten and your voice principle is updated, so every later card follows it. After a few weeks, you revise less because the corrections have added up.",
      },
      { type: "h2", text: "One network or many" },
      {
        type: "p",
        text: "This is the honest split. Buffer covers many networks and we cover one. If you need Instagram and TikTok, Buffer is the better tool and GoodSocials will never replace it. If LinkedIn is where your clients read you, a tool that only does LinkedIn can go deeper: a quality gate that holds posts with invented numbers, posts that cite real figures from your Stripe or GitHub, and a calendar that publishes one post a day at 09:00 in your timezone.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Buffer charges per connected channel, with a free tier and volume discounts; check their pricing page, it changes often. GoodSocials is $100 a month for one LinkedIn profile, writing included. Some people run both: GoodSocials for LinkedIn, Buffer for the rest.",
      },
    ],
  },
  {
    slug: "hootsuite",
    name: "Hootsuite",
    site: "hootsuite.com",
    category: "Social media suite for teams",
    summary:
      "Hootsuite is a complete social media suite, with scheduling, a shared inbox, listening and reporting across every major network in one place.",
    verdict:
      "Pick Hootsuite if you run a brand's social presence across many networks and need an inbox, listening and reports for a team. Pick GoodSocials if the job is getting one person, or a dozen clients, posting on LinkedIn every day without writing the posts.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams managing brand accounts across networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn, Instagram, Facebook, X, TikTok, YouTube, Pinterest and more",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, with Hootsuite's AI writing tools to help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Approval workflows on higher plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling, bulk upload and recommended times",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per user, tiers by accounts and features, no permanent free plan",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You answer comments and messages across several networks from one inbox.",
      "You need listening and brand reports as well as a posting schedule.",
      "Several people on a team publish and need roles and permissions.",
    ],
    chooseUs: [
      "Your LinkedIn profile is the channel, and nobody on the team has time to write for it.",
      "You want a board of finished posts to approve instead of a composer to fill.",
      "You measure success in posts published this month.",
    ],
    blocks: [
      { type: "h2", text: "A suite for brand accounts" },
      {
        type: "p",
        text: "Hootsuite is built for a social team looking after a brand. It schedules to the major networks, collects comments and messages in a shared inbox, tracks mentions through listening, and turns it all into reports for a manager. Its AI tools help draft captions. If your job title has 'social' in it and you look after five networks, Hootsuite covers most of your day.",
      },
      { type: "h2", text: "What GoodSocials leaves out on purpose" },
      {
        type: "p",
        text: "We do not have an inbox. We do not reply to comments, read your feed or chart your impressions. That is a real gap if engagement is your job, and Hootsuite fills it well. What we do instead is one narrow thing: keep a person's LinkedIn profile posting close to daily.",
      },
      {
        type: "list",
        items: [
          "The agent writes seven posts from your website at sign up, spread across four themes.",
          "You approve, revise or reject each card. A revise comment also updates your voice, visual or format principle.",
          "A quality gate holds any post with an invented number or a claim with nothing behind it.",
          "The dashboard leads with posts published this month and your current streak.",
        ],
      },
      { type: "h2", text: "Brand accounts versus people" },
      {
        type: "p",
        text: "Hootsuite is strongest on company pages and brand handles. GoodSocials only posts to personal LinkedIn profiles, because that is where founders and consultants are read. Posts are written in the third person by rule, naming the company and the source, since software wrote them and a first-person claim is one nobody made.",
      },
      { type: "h2", text: "Cost and fit" },
      {
        type: "p",
        text: `Hootsuite prices per user, with tiers that add accounts and features, and a free trial rather than a free plan; check their pricing page for current numbers. For a team of three that bill grows quickly. GoodSocials is $100 a month per LinkedIn profile, or $1,000 a month for up to ${AGENCY_SEATS} profiles on Agency, with no per-seat charge.`,
      },
    ],
  },
  {
    slug: "sprout-social",
    name: "Sprout Social",
    site: "sproutsocial.com",
    category: "Enterprise social media management",
    summary:
      "Sprout Social is a polished platform for larger teams, strong on its Smart Inbox, listening and reporting that executives can read.",
    verdict:
      "Pick Sprout Social if you run social for a company with several people, several networks and a need for customer care and serious analytics. Pick GoodSocials if you need one LinkedIn profile, or a handful of client profiles, to post daily with posts written for you.",
    rows: [
      {
        label: "Built for",
        them: "Mid-size and enterprise social, care and marketing teams",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, plus reviews on some plans",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, with AI assistance inside the composer",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Configurable approval workflows for teams",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar, queues and optimal send times",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per seat per month, tiers by feature, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Customer care runs through social and you need a shared inbox with assignment.",
      "Leadership wants reports on reach, sentiment and response times.",
      "You manage brand accounts on many networks with a team of specialists.",
    ],
    chooseUs: [
      "The account that matters is a person's LinkedIn profile.",
      "No one on the team has the hours to write a post a day.",
      "You want corrections to become rules the writer follows from then on.",
    ],
    blocks: [
      { type: "h2", text: "Where Sprout Social is strongest" },
      {
        type: "p",
        text: "Sprout Social is one of the most complete tools in the category. Its Smart Inbox pulls messages from every network into one queue your team can assign and answer. Listening tracks what people say about you. Reports come out clean enough to forward to a board. For a company with a social team, customer care on Instagram and a need to prove results, it is a strong choice.",
      },
      { type: "h2", text: "A different job" },
      {
        type: "p",
        text: "Sprout helps a team manage what the team creates. GoodSocials creates it. The agent reads your website at sign up, writes four themes for what your profile should be known for, and puts seven posts on a board. From then on it keeps the board filled so the queue has a few days of runway.",
      },
      {
        type: "p",
        text: "The piece that matters most is how it handles your feedback. A revise comment on a card rewrites that card and updates one of three brand principles: voice, visual or format. The next card is written with the new rule. Sprout's approval flow records what a reviewer said; ours turns it into an instruction the writer keeps.",
      },
      { type: "h2", text: "Your own numbers, read only" },
      {
        type: "p",
        text: "Sprout reports on your social numbers. GoodSocials reads your business numbers, read only, from Stripe, GitHub, PostHog, Plausible or Notion with a pasted key, so a post can cite real revenue, merged pull requests or signups. When a post needs a figure only you know, the card asks for it instead of inventing one, and the quality gate holds anything that looks made up.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Sprout Social charges per seat per month, with plan tiers that add features, and offers a free trial; check their pricing page for current rates. GoodSocials has no seats. It is $100 a month per LinkedIn profile, $1,000 for up to ${AGENCY_SEATS}.`,
      },
    ],
  },
  {
    slug: "later",
    name: "Later",
    site: "later.com",
    category: "Visual planner for social",
    summary:
      "Later made its name with a visual, drag-and-drop planner for Instagram and has grown into a scheduler for the visual networks with link in bio and creator tools.",
    verdict:
      "Pick Later if your content is photos and video for Instagram, TikTok and Pinterest and you want to see the grid before it goes live. Pick GoodSocials if your channel is LinkedIn and the content is written posts you would rather approve than write.",
    rows: [
      {
        label: "Built for",
        them: "Brands, creators and social teams with visual content",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Instagram, TikTok, Pinterest, Facebook, Threads, YouTube, LinkedIn and more",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with AI caption help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Collaboration and approvals on higher plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Visual calendar, grid preview, best time to post",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Limited free plan, tiers by social sets, users and post limits",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Your content starts as photos and short video.",
      "You want to preview an Instagram grid and manage a link in bio page.",
      "You post to the visual networks every day and LinkedIn is a side channel.",
    ],
    chooseUs: [
      "LinkedIn is your main channel and the posts are words first.",
      "You need someone to write the posts.",
      "You want posts that cite your own figures from Stripe or PostHog.",
    ],
    blocks: [
      { type: "h2", text: "What Later is good at" },
      {
        type: "p",
        text: "Later is a planner for people who think in pictures. You drag photos and videos from a media library onto a calendar, preview how your Instagram grid will look, and schedule to the visual networks. Link in bio pages and creator tools sit alongside it. LinkedIn is supported, but the product's centre of gravity is Instagram and TikTok.",
      },
      { type: "h2", text: "Words first" },
      {
        type: "p",
        text: "LinkedIn rewards a different kind of post. The ones that work tend to be a framework, a data breakdown, a receipt with a real number, or a finding. GoodSocials decides the kind of post with the idea, so a receipt reads like a receipt from its first sentence. Images are generated to go with the text, up to 200 a month per profile, and they are the last step on the board instead of the first.",
      },
      { type: "h2", text: "How the board works" },
      {
        type: "list",
        items: [
          "Sign in with LinkedIn and paste your website URL.",
          "The agent writes four themes and seven posts across them.",
          "Approve, revise or reject each card. A revise comment updates your brand principles too.",
          "Approved posts pass a quality gate and publish at 09:00 in your timezone, one a day.",
        ],
      },
      { type: "h2", text: "Pricing and fit" },
      {
        type: "p",
        text: "Later has a limited free plan and paid tiers set by social sets, users and monthly post limits, with add-ons for more; check their pricing page, it changes often. GoodSocials is $100 a month for one LinkedIn profile with writing included. If you run a visual brand and a founder's LinkedIn, the two tools cover different ground and can sit side by side.",
      },
    ],
  },
  {
    slug: "taplio",
    name: "Taplio",
    site: "taplio.com",
    category: "LinkedIn growth toolkit",
    summary:
      "Taplio packs a lot of LinkedIn into one tool: AI writing, a library of top-performing posts, scheduling, analytics, engagement help and a lead database.",
    verdict:
      "Pick Taplio if you want to work LinkedIn hands on, writing with AI, studying what performs, engaging with others and prospecting. Pick GoodSocials if you want to spend five minutes approving posts and have the writing, scheduling and publishing handled.",
    rows: [
      {
        label: "Built for",
        them: "Creators and sellers growing an audience on LinkedIn",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with AI drafts, hooks and rewrites trained on popular posts",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Drafts and a queue you manage yourself",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Queue with suggested times",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiered monthly plans, AI features on the higher tiers",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You enjoy writing on LinkedIn and want AI help and inspiration while you do it.",
      "You want post analytics, engagement suggestions and a lead database in one place.",
      "Growing followers is the goal you track.",
    ],
    chooseUs: [
      "You do not want to write, study viral posts or spend time in the feed.",
      "You want posts built on your own numbers instead of patterns from other people's.",
      "You judge the month by how many days you posted.",
    ],
    blocks: [
      { type: "h2", text: "A toolkit for doing LinkedIn yourself" },
      {
        type: "p",
        text: "Taplio is one of the best-known LinkedIn tools, and it earns it with breadth. There is an AI writer trained on a large set of LinkedIn posts, a feed of high-performing posts to borrow structure from, a scheduler, analytics on your posts and followers, help drafting comments on other people's posts, and a database for finding leads. For someone who treats LinkedIn as a daily practice, it puts a lot of help in one place.",
      },
      { type: "h2", text: "Hands on or hands off" },
      {
        type: "p",
        text: "Taplio assumes you are at the desk. GoodSocials assumes you are not. The agent writes from your website and four themes, puts the post on a board, and waits for a yes. You approve, revise or reject. The board refills itself when fewer than three days of posts are scheduled.",
      },
      {
        type: "p",
        text: "The difference that compounds is feedback. In many AI writers, a correction lives in one post. In GoodSocials, a revise comment updates your voice, visual or format principle, so it carries into every card after it. That is how week six gets closer to your voice than week one.",
      },
      { type: "h2", text: "Engagement is out of scope" },
      {
        type: "p",
        text: "We do not write comments, send messages, run engagement pods or search for leads. If those are part of your LinkedIn plan, Taplio does them and we will not. GoodSocials does publishing well and stops there: posts that pass a quality gate for invented numbers and empty claims, and a streak you can see.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Taplio sells tiered monthly plans, and the AI writing features sit above the entry tier; check their pricing page for what each tier includes. GoodSocials is one plan per profile at $100 a month, with writing, images and publishing all included.",
      },
    ],
  },
  {
    slug: "supergrow",
    name: "Supergrow",
    site: "supergrow.ai",
    category: "AI LinkedIn writer and scheduler",
    summary:
      "Supergrow is an affordable LinkedIn writing tool with voice matching, carousel and visual makers, scheduling and team spaces for agencies.",
    verdict:
      "Pick Supergrow if you want an inexpensive AI writer for LinkedIn with carousels and you are happy to drive it. Pick GoodSocials if you want the writing to run on its own and your corrections to become lasting rules.",
    rows: [
      {
        label: "Built for",
        them: "Founders, creators and ghostwriters on LinkedIn",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You prompt the AI, trained on your writing style",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Client approval workflows on the team plan",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduler with a content calendar",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per profile tiers, a team plan for agencies, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Budget is tight and you are willing to prompt the writer yourself.",
      "Carousels and infographics are a big part of your LinkedIn mix.",
      "You like starting from a conversation or a voice note and shaping the post yourself.",
    ],
    chooseUs: [
      "You want a full week of posts to appear without prompting.",
      "You want feedback on one post to change how every later post is written.",
      "Posts should cite real numbers from your own tools, checked before they go out.",
    ],
    blocks: [
      { type: "h2", text: "What Supergrow offers" },
      {
        type: "p",
        text: "Supergrow is a LinkedIn writer at a price that is easy to say yes to. It learns your writing style, generates posts from a topic or your own material, builds carousels and visuals, and schedules them. There is a team plan with shared spaces and client approvals, which makes it a reasonable pick for ghostwriters on a budget.",
      },
      { type: "h2", text: "Who drives" },
      {
        type: "p",
        text: "In Supergrow, you start each post: pick a topic, prompt, edit, schedule. GoodSocials takes the first move away. Your website becomes four themes, the themes become ideas, and ideas are dealt across themes so no single one takes the board. Each idea is given a kind up front, a framework, a data breakdown, a receipt or a finding, because those are different posts from the first line.",
      },
      {
        type: "p",
        text: "When a receipt needs a number only you know, the card names it in your words and leaves a bracket in the draft. You fill it in with a revise comment. Nothing gets invented to fill the gap, and the quality gate holds any post that tries.",
      },
      { type: "h2", text: "Corrections that stay" },
      {
        type: "p",
        text: "Voice matching learns your style from your writing. GoodSocials keeps three short brand principles per profile, voice, visual and format, and every revise comment updates the matching one. You can read and edit them in settings. So the tone gets closer over weeks, and you can see why.",
      },
      { type: "h2", text: "Price and agency fit" },
      {
        type: "p",
        text: `Supergrow is priced per profile in tiers with a separate team plan; check their pricing page, it changes often. It costs less than GoodSocials. The $100 a month buys the writing done without prompts, the gate and the persistence. For agencies, our $1,000 plan covers up to ${AGENCY_SEATS} profiles and each client authorises their own LinkedIn, so you never hold a password.`,
      },
    ],
  },
  {
    slug: "authoredup",
    name: "AuthoredUp",
    site: "authoredup.com",
    category: "LinkedIn editor and analytics",
    summary:
      "AuthoredUp is a well-loved browser extension that adds formatting, previews, a post library and analytics to LinkedIn's own composer.",
    verdict:
      "Pick AuthoredUp if you write your own LinkedIn posts and want better formatting, previews and analytics while you do. Pick GoodSocials if you want the posts written for you and your part to be approving them.",
    rows: [
      {
        label: "Built for",
        them: "People who write their own LinkedIn posts",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn, including profiles, pages and groups",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with formatting help and saved hooks and endings",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They are your post, as written",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Draft sharing on team plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling from inside LinkedIn",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per user per month, team pricing, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You like writing and want the best editor and preview for LinkedIn.",
      "You want detailed analytics on your own posts.",
      "You want to stay inside LinkedIn's interface.",
    ],
    chooseUs: [
      "You do not write, or you have stopped, and want posts to appear anyway.",
      "You care about posting daily more than tuning each post's formatting.",
      "You manage several client profiles and need one board per client.",
    ],
    blocks: [
      { type: "h2", text: "A better composer" },
      {
        type: "p",
        text: "AuthoredUp lives in your browser and improves LinkedIn itself. Bold and italic text, clean line breaks, a preview of how the post will cut off in the feed, saved hooks and endings, a library of your past posts, and analytics that LinkedIn does not show you. For people who already write, it removes a lot of small friction, and its users say so.",
      },
      { type: "h2", text: "The writer versus the editor" },
      {
        type: "p",
        text: "AuthoredUp makes writing easier. GoodSocials removes the writing. The two are aimed at different people: one who enjoys the craft and wants sharper tools, and one who knows they should post but has not in a month. If you are the first, AuthoredUp is the better buy.",
      },
      {
        type: "p",
        text: "If you are the second, the board is the whole product. Seven posts appear after you paste your URL. You tap Approve, Revise or Reject. A revise comment like 'less hedging, name the customer' rewrites the card and becomes part of your voice principle, so you do not have to say it twice.",
      },
      { type: "h2", text: "Your history, kept as reference" },
      {
        type: "p",
        text: "LinkedIn does not let apps read your past posts, so GoodSocials asks you for your LinkedIn data archive instead. Upload the Shares.csv file and your old posts show on the calendar beside the new ones. They are there for reference and are never republished.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "AuthoredUp is priced per user per month with team pricing and a free trial; check their pricing page for current rates. It costs far less than GoodSocials because you do the writing. Our $100 a month is for the writing, images, the quality gate and publishing, for one profile.",
      },
    ],
  },
  {
    slug: "typefully",
    name: "Typefully",
    site: "typefully.com",
    category: "Writing app for text-first networks",
    summary:
      "Typefully is a clean, distraction-free writing and scheduling app for X, LinkedIn, Threads, Bluesky and Mastodon, with a free plan to start.",
    verdict:
      "Pick Typefully if you write your own posts and publish to several text-first networks from one calm editor. Pick GoodSocials if LinkedIn is the only network that matters and you want the posts written and queued for you.",
    rows: [
      {
        label: "Built for",
        them: "Writers and founders posting to text-first networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "X, LinkedIn, Threads, Bluesky, Mastodon",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with AI help on paid plans",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Shared drafts and comments on team plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Queue and scheduling across networks",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then low monthly tiers by features and accounts",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You write every day and want a pleasant editor for it.",
      "You post the same ideas to X, Threads and Bluesky as well as LinkedIn.",
      "You want a free plan or a low monthly cost.",
    ],
    chooseUs: [
      "Writing is the step you keep skipping.",
      "You want a week of LinkedIn posts ready to approve on Monday.",
      "You want posts with real figures from Stripe, GitHub or PostHog.",
    ],
    blocks: [
      { type: "h2", text: "Why writers like Typefully" },
      {
        type: "p",
        text: "Typefully is a good writing surface. The editor gets out of the way, threads and long posts are easy to shape, and scheduling to X, LinkedIn, Threads, Bluesky and Mastodon happens from the same place. Paid plans add AI help and collaboration. For a founder who writes in public across networks, it is hard to beat for the price.",
      },
      { type: "h2", text: "When the page stays blank" },
      {
        type: "p",
        text: "A good editor does not help if you never open it. GoodSocials is for the weeks you would not. It turns your website into four themes, writes posts across them, and lines them up on a board. Your time goes into reading and deciding.",
      },
      {
        type: "list",
        items: [
          "Approve moves a card toward Scheduled.",
          "Revise takes a comment, rewrites the card and updates the matching brand principle.",
          "Reject removes the card and the board makes room for another idea.",
        ],
      },
      { type: "h2", text: "A post with a source" },
      {
        type: "p",
        text: "Typefully's AI helps shape your words. GoodSocials can bring the substance. Connect Stripe, GitHub, PostHog, Plausible or Notion with a read-only key, and posts can cite this month's revenue, merged pull requests or signups. A quality gate checks every post for invented numbers and unsupported claims before it can be scheduled.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Typefully has a free plan and low monthly tiers; check their pricing page for current limits. GoodSocials is $100 a month for one LinkedIn profile because the writing is the product. Many founders who like writing will be happier in Typefully.",
      },
    ],
  },
  {
    slug: "hypefury",
    name: "Hypefury",
    site: "hypefury.com",
    category: "Scheduling and growth automation",
    summary:
      "Hypefury combines scheduling with growth automations such as autoplugs, cross-posting and an engagement builder, at a low monthly price.",
    verdict:
      "Pick Hypefury if you create across several networks and want automations that plug your offer and recycle what worked. Pick GoodSocials if you want LinkedIn posts written for you and published daily, with no automation touching the comments.",
    rows: [
      {
        label: "Built for",
        them: "Creators and solo businesses growing an audience",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn, Instagram, Threads, Bluesky, TikTok; X no longer supported",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with inspiration and AI help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "A queue you manage yourself",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Queue, cross-posting and autoplug replies",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per channel or a flat plan, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You sell a product or newsletter and want posts that plug it automatically.",
      "You publish to Instagram, Threads, Bluesky and TikTok as well as LinkedIn.",
      "You want a low monthly price and you write your own posts.",
    ],
    chooseUs: [
      "You want nothing automated in the comments of a client's feed.",
      "You want the posts written for you.",
      "You want a post to be checked for made-up numbers before it goes out.",
    ],
    blocks: [
      { type: "h2", text: "Automation for creators" },
      {
        type: "p",
        text: "Hypefury started as a scheduler for X and grew a set of automations around it. Autoplugs add a comment promoting your offer once a post does well. Cross-posting sends one post to several networks. An engagement builder surfaces accounts and keywords to reply to. Their site now says X is no longer supported, with LinkedIn, Instagram, Threads, Bluesky and TikTok as the channels. For creators with something to sell, it is an efficient setup.",
      },
      { type: "h2", text: "A quieter approach" },
      {
        type: "p",
        text: "GoodSocials does not automate anything around a post. No auto-comments, no DMs, no likes. We publish one post a day to a personal LinkedIn profile, and that is where our work ends. For consultants and agencies posting as a client, that restraint is the point: nothing goes out under a client's name that someone did not approve.",
      },
      { type: "h2", text: "The writing is the product" },
      {
        type: "p",
        text: "Hypefury helps you distribute posts. GoodSocials writes them. The agent works from your website and four themes, picks the kind of post with the idea, and writes it in the third person, naming the company and the source. Your revise comments update the brand principles so the next card needs fewer of them.",
      },
      {
        type: "p",
        text: "Every card passes a quality gate before it can be scheduled. The gate holds invented numbers, claims with nothing behind them and posts that say nothing, and shows the reason with a revise comment that fixes it.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Hypefury offers a per-channel plan and a flat plan with a free trial; check their pricing page, it changes often. It costs much less than GoodSocials, which charges $100 a month per LinkedIn profile with the writing included.",
      },
    ],
  },
  {
    slug: "publer",
    name: "Publer",
    site: "publer.com",
    category: "Budget multi-network scheduler",
    summary:
      "Publer is a capable, low-cost scheduler that covers a wide list of networks, including some rivals skip, with a free plan to start.",
    verdict:
      "Pick Publer if you want to schedule to many networks for very little and write the posts yourself. Pick GoodSocials if you want one LinkedIn profile, or ten, kept posting daily with the writing done.",
    rows: [
      {
        label: "Built for",
        them: "Small businesses and freelancers on a budget",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Most major networks plus Google Business, Telegram and WordPress",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with an AI assistant",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Team roles and approvals on paid plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar, bulk scheduling and recycling",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then base plan plus per account and per member",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You need many networks, including Telegram or Google Business, for a small budget.",
      "You batch your own content and want bulk scheduling.",
      "A free plan would cover you for now.",
    ],
    chooseUs: [
      "The writing is the part you cannot find time for.",
      "LinkedIn is the only channel you need to get right.",
      "You want a stable voice built from your own corrections.",
    ],
    blocks: [
      { type: "h2", text: "A lot of scheduler for little money" },
      {
        type: "p",
        text: "Publer is a practical tool. It schedules to a long list of networks, including a few that others skip, handles bulk uploads, recycles posts, and has an AI assistant for drafting. The free plan is generous enough to try properly. For a small business spreading posts across several places, it does the job at a low cost.",
      },
      { type: "h2", text: "Same week, different effort" },
      {
        type: "p",
        text: "Picture a week in each tool. In Publer, you sit down, write five posts, perhaps ask the assistant for variations, and drop them into the calendar. In GoodSocials, you open the board on Monday and find posts already drafted from your themes. You read them, approve three, revise one with a comment and reject one. The board refills.",
      },
      {
        type: "p",
        text: "The revise comment is where the tools differ most. It rewrites the card and also updates your voice, visual or format principle. The following Monday's posts are already written with that rule.",
      },
      { type: "h2", text: "The 60 day problem" },
      {
        type: "p",
        text: "LinkedIn access for any app expires every 60 days, and LinkedIn offers no silent renewal. A scheduler that misses this keeps accepting posts that will never publish. GoodSocials emails you before access expires, shows a banner, and pauses scheduling cleanly if it lapses, so you hear about it from us and not from a client.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Publer has a free plan and paid plans that add cost per social account and per team member; check their pricing page for current rates. It is much cheaper than GoodSocials. The $100 a month for one profile pays for the writing, the images and the checks.",
      },
    ],
  },
  {
    slug: "socialbee",
    name: "SocialBee",
    site: "socialbee.com",
    category: "Category-based social scheduler",
    summary:
      "SocialBee organises posts into content categories that rotate and recycle, with an AI copilot that can draft a strategy and posts from your website.",
    verdict:
      "Pick SocialBee if you run several networks and want a category system that recycles evergreen content, with AI help on top. Pick GoodSocials if LinkedIn is the channel and you want the writer to learn from every correction you make.",
    rows: [
      {
        label: "Built for",
        them: "Small businesses and agencies on several networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, including LinkedIn profiles and pages",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with an AI copilot that drafts from your website",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Team workspaces and approvals",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Category schedules with evergreen recycling",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiered monthly plans by profiles, agency tiers, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You want posts recycled on a schedule across several networks.",
      "You like organising content into categories that rotate through the week.",
      "You need an inbox and analytics across networks as well as scheduling.",
    ],
    chooseUs: [
      "You want every post to be new.",
      "Corrections should change how the next post is written.",
      "Posts should draw on your own business numbers.",
    ],
    blocks: [
      { type: "h2", text: "Categories and a copilot" },
      {
        type: "p",
        text: "SocialBee's core idea is content categories. You sort posts into folders like tips, promotions or behind the scenes, give each a slot in the week, and let evergreen posts come back around. Its AI copilot can read your website and propose a strategy, networks and a set of posts. It also has an inbox and analytics. It is a sensible system for a small business on several networks.",
      },
      { type: "h2", text: "Close on paper, different in use" },
      {
        type: "p",
        text: "SocialBee and GoodSocials both start from your website, and both sort content by topic. SocialBee's categories exist to rotate and recycle. GoodSocials' four themes exist so the agent keeps finding new things to say after the homepage is used up, so week four does not read like week one. Nothing is republished.",
      },
      {
        type: "p",
        text: "The larger difference is what happens after the first draft. In GoodSocials, each revise comment updates one of three brand principles for the profile. The principles are short, readable and editable, and every later card is written against them.",
      },
      { type: "h2", text: "Checks before anything goes live" },
      {
        type: "p",
        text: "Every card passes a quality gate on its way to Scheduled: rules in code, then an editor pass for invented numbers, unsupported claims and posts that say nothing. A held card shows why, with a revise comment ready to fix it. If a post needs a number only you have, the card asks for it by name.",
      },
      { type: "h2", text: "Pricing and agencies" },
      {
        type: "p",
        text: `SocialBee sells monthly tiers by number of profiles, plus agency tiers; check their pricing page for current details. For agencies focused on LinkedIn, GoodSocials is $1,000 a month for up to ${AGENCY_SEATS} client profiles, each with its own board, principles and themes, and each client authorises their own profile.`,
      },
    ],
  },
  {
    slug: "metricool",
    name: "Metricool",
    site: "metricool.com",
    category: "Analytics-first social planner",
    summary:
      "Metricool is strong on analytics and reporting across social networks, ads and websites, with a planner and a free plan to start.",
    verdict:
      "Pick Metricool if reporting is central, you manage several brands, and you want analytics, ads and scheduling in one tool. Pick GoodSocials if your aim is posting on LinkedIn every day and you want the posts written for you.",
    rows: [
      {
        label: "Built for",
        them: "Marketers and agencies who report on social results",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, plus ads and web analytics",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "You, with an AI assistant",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Client approvals on higher plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Planner with best time suggestions",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then tiers by number of brands",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Clients expect monthly reports on reach, engagement and ads.",
      "You manage many brands and want the price to follow brand count.",
      "You want social, ads and website numbers side by side.",
    ],
    chooseUs: [
      "You measure the month by posts published and your streak.",
      "Nobody on the account has time to write.",
      "You want LinkedIn posts built on your Stripe or Plausible numbers.",
    ],
    blocks: [
      { type: "h2", text: "Numbers first" },
      {
        type: "p",
        text: "Metricool grew out of analytics, and it shows. It pulls in data from social networks, ad accounts and your website, produces reports clients can read, and has a planner for scheduling. Pricing follows the number of brands, which suits agencies. There is a free plan; check which networks it covers, since some are limited to paid tiers.",
      },
      { type: "h2", text: "A different number" },
      {
        type: "p",
        text: "We made a choice Metricool would not: GoodSocials shows no charts of impressions or followers. The dashboard leads with posts published this month and your current streak, because the gap we see most often among founders and consultants is too few posts: two in March, none in April.",
      },
      {
        type: "p",
        text: "So the product is built around cadence. The agent keeps the board stocked, the calendar holds one post per day, and each one publishes at 09:00 in the board's timezone. If you want to see what performed, Metricool will tell you; GoodSocials will make sure there is something to measure.",
      },
      { type: "h2", text: "Your business numbers in the post" },
      {
        type: "p",
        text: "Metricool reads your social numbers. GoodSocials reads your business numbers, read only, from Stripe, GitHub, PostHog, Plausible and Notion. Those figures go into the posts themselves, as receipts and data breakdowns. When a post needs a number the tools cannot supply, the card asks you for it.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Metricool has a free plan and paid tiers set by number of brands; check their pricing page, it changes often. GoodSocials is $100 a month per profile or $1,000 for up to ${AGENCY_SEATS}. Agencies often use a reporting tool alongside us.`,
      },
    ],
  },
  {
    slug: "agorapulse",
    name: "Agorapulse",
    site: "agorapulse.com",
    category: "Social inbox and publishing",
    summary:
      "Agorapulse is known for one of the best social inboxes in the category, plus publishing, reporting and optional listening for teams and agencies.",
    verdict:
      "Pick Agorapulse if answering comments and messages across networks is a big part of the job and you want publishing and reports alongside. Pick GoodSocials if the job is keeping LinkedIn profiles posting daily with posts written for you.",
    rows: [
      {
        label: "Built for",
        them: "Social teams and agencies who publish and engage",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, including LinkedIn profiles and pages",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, with AI writing help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Internal and client approval workflows",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Shared calendar, queues and bulk scheduling",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per user per month, listening as a paid add-on",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Your team works through comments and messages every day.",
      "You need client approvals and reporting across many networks.",
      "You want listening as part of the same tool.",
    ],
    chooseUs: [
      "The client wants their LinkedIn posting taken care of, and handles their own replies.",
      "You want a writer that learns each client's voice from your comments.",
      "You price your service per profile and want your cost to match.",
    ],
    blocks: [
      { type: "h2", text: "Built around the inbox" },
      {
        type: "p",
        text: "Agorapulse's inbox is the reason many teams choose it. Comments, messages and mentions from every network arrive in one place, can be assigned and tagged, and get cleared like email. Publishing, a shared calendar, approvals and reports sit around that, and listening is available as an add-on. For community managers and agencies that handle engagement, it is a strong tool.",
      },
      { type: "h2", text: "Posting only" },
      {
        type: "p",
        text: "GoodSocials has no inbox. It does not reply to comments or send messages, and it never will, because a reply under a person's name should come from that person. What it does is the other half of a client retainer: the posts.",
      },
      {
        type: "p",
        text: "Each client profile gets its own board, four themes, three brand principles and a queue. You and the client read cards, approve, revise or reject. Revisions teach that profile's writer, not a shared one, so one client's tone never leaks into another's.",
      },
      { type: "h2", text: "What an agency has to worry about" },
      {
        type: "list",
        items: [
          "Each client authorises their own LinkedIn profile, so the agency never holds a password.",
          "LinkedIn access expires every 60 days. We email before it does, show a banner, and pause scheduling cleanly if it lapses.",
          "Posts are written in the third person, naming the company and the source, so nothing reads as a claim the client did not make.",
        ],
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Agorapulse charges per user per month, with listening sold separately; check their pricing page for current rates. GoodSocials charges per LinkedIn profile: $100 a month for one, $1,000 a month for up to ${AGENCY_SEATS}, with no charge per team member.`,
      },
    ],
  },
  {
    slug: "sendible",
    name: "Sendible",
    site: "sendible.com",
    category: "Social media tool for agencies",
    summary:
      "Sendible is made for agencies, with client workspaces, client approvals, white-label reports on higher plans and pricing that includes many users.",
    verdict:
      "Pick Sendible if you run social media for many clients across many networks and want client dashboards and white-label reports. Pick GoodSocials if your agency's offer is LinkedIn ghostwriting and you want the drafts written for you.",
    rows: [
      {
        label: "Built for",
        them: "Agencies managing many clients across networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, plus blogs and Google Business",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, with AI assistance",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Client logins that preview and approve content",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar, queues, bulk import",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by profiles and users, white label on higher plans",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You run every network for dozens of clients.",
      "You want white-label reports and client dashboards with your agency's brand.",
      "Your team writes the content and needs a place to manage it.",
    ],
    chooseUs: [
      "You sell LinkedIn ghostwriting and writing time is your bottleneck.",
      "You want each client's voice to improve from your corrections.",
      "You want a price per client profile that fits a LinkedIn retainer.",
    ],
    blocks: [
      { type: "h2", text: "An agency tool from the start" },
      {
        type: "p",
        text: "Sendible has served agencies for years. Clients get their own logins to preview and approve posts, reports can carry your agency's brand on higher tiers, and plans include multiple users so a growing team does not multiply the bill. It covers all the main networks. If you run broad social retainers, it is well suited.",
      },
      { type: "h2", text: "For LinkedIn ghostwriting retainers" },
      {
        type: "p",
        text: "A different kind of agency sells LinkedIn posts for founders and executives. The cost in that business is writing hours. GoodSocials moves the first draft to the agent. For each client profile, it reads their website, sets four themes and writes posts across them. Your team reviews and corrects instead of starting from scratch.",
      },
      {
        type: "p",
        text: "Corrections are where your team's judgement builds up. Each revise comment updates that client's voice, visual or format principle. After a month, the principles hold what your writers know about the client, written down, and the drafts need less work.",
      },
      { type: "h2", text: "What the client sees" },
      {
        type: "p",
        text: "Clients authorise their own LinkedIn profile, so you never hold their password. Every post passes a quality gate that holds invented numbers and unsupported claims. If a post needs a figure only the client knows, the card names it and waits, which makes a good question to send them.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Sendible prices by tiers of profiles and users, with white label on higher plans; check their pricing page for current details. GoodSocials Agency is $1,000 a month for up to ${AGENCY_SEATS} LinkedIn profiles. Consultancy is $2,000 a month for up to ${AGENCY_SEATS}, with the founder setting it up with you and a weekly call.`,
      },
    ],
  },
  {
    slug: "planable",
    name: "Planable",
    site: "planable.io",
    category: "Content collaboration and approvals",
    summary:
      "Planable makes review and approval easy, with posts previewed as they will look and multi-step approval chains that clients can use without training.",
    verdict:
      "Pick Planable if approvals between your team, clients and legal are the hard part and your team writes the posts. Pick GoodSocials if writing is the hard part and you want a writer that learns from the approvals.",
    rows: [
      {
        label: "Built for",
        them: "Agencies and brands with review-heavy workflows",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, with AI help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "Comments and edits stay on that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "None, optional, required or multi-level approvals",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling after approval",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per workspace per month, add-ons for analytics and inbox",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "Posts pass through several reviewers before they go out.",
      "Clients need to comment on a preview that looks like the real feed.",
      "You publish across many networks and formats.",
    ],
    chooseUs: [
      "The review is easy but writing the posts takes all week.",
      "You want feedback to change future drafts as well as the current one.",
      "LinkedIn profiles are the whole engagement.",
    ],
    blocks: [
      { type: "h2", text: "Approvals done well" },
      {
        type: "p",
        text: "Planable is built around the moment a client sees a post. Posts show as they will look in the feed, reviewers comment in place, and approval chains can be as light or as strict as the account needs, up to team, client, legal and executive sign off. Pricing is per workspace, where each workspace is a brand or client. For agencies whose pain is chasing approvals, it removes a lot of email.",
      },
      { type: "h2", text: "What an approval can teach" },
      {
        type: "p",
        text: "Both tools care about approval. The difference is what an approval does next. In Planable, a comment is a note on one post. In GoodSocials, a revise comment rewrites the card and updates the brand principle it touches: voice, visual or format. The next card starts from the updated rule.",
      },
      {
        type: "p",
        text: "Over a few weeks, that loop changes the ratio of work. Early on you revise often. Later, most cards go straight through, because the corrections you made have become part of how the posts are written.",
      },
      { type: "h2", text: "Three actions, five columns" },
      {
        type: "p",
        text: "Planable gives you a flexible workflow to configure. GoodSocials gives you a fixed one: Idea, Draft, Image, Scheduled, Posted, with Approve, Revise and Reject on every card. Fewer choices, less setup, and a quality gate before anything reaches Scheduled.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Planable charges per workspace per month, with add-ons for analytics and engagement; check their pricing page, it changes often. GoodSocials charges per LinkedIn profile, $100 a month, or $1,000 for up to ${AGENCY_SEATS}, with writing included.`,
      },
    ],
  },
  {
    slug: "loomly",
    name: "Loomly",
    site: "loomly.com",
    category: "Brand success platform",
    summary:
      "Loomly pairs a clear calendar and approval workflow with daily post ideas from trends, holidays and RSS feeds, and a shared library for brand assets.",
    verdict:
      "Pick Loomly if a marketing team plans content across networks and wants ideas, approvals and an asset library in one calendar. Pick GoodSocials if you want LinkedIn posts written from your own business and themes, ready to approve.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams and agencies planning brand content",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "All major networks, including LinkedIn",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "Your team, from post ideas and AI help",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Custom approval workflows with roles",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar with automated publishing",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by users and social accounts, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "A team plans a brand calendar across networks and wants trend-based prompts.",
      "You need an asset library and approvals for a brand.",
      "You want post optimisation tips as you write.",
    ],
    chooseUs: [
      "Your ideas should come from your own business.",
      "You want finished drafts to approve.",
      "You want corrections to carry into every later post.",
    ],
    blocks: [
      { type: "h2", text: "Ideas, calendar and approvals" },
      {
        type: "p",
        text: "Loomly gives a marketing team a calendar that is easy to read, an approval workflow with roles, and a library for brand assets. Its post ideas pull from trends, holidays and RSS feeds, so the calendar rarely starts empty. The composer offers tips while you write. It is a tidy home for a team that plans brand content across networks.",
      },
      { type: "h2", text: "Where the ideas come from" },
      {
        type: "p",
        text: "Loomly's ideas are prompts drawn from the outside world. GoodSocials' ideas come from inside your business. At sign up the agent reads your website and writes four themes, what your profile should be known for. Ideas are dealt across those themes, and each one is given a kind: a framework, a data breakdown, a receipt or a finding.",
      },
      {
        type: "p",
        text: "When you connect Stripe, GitHub, PostHog, Plausible or Notion with a read-only key, those figures feed the ideas as well. A receipt post can cite your own revenue or shipped work. When the number is only in your head, the card asks you for it and the draft leaves a bracket instead of guessing.",
      },
      { type: "h2", text: "Feedback that sticks" },
      {
        type: "p",
        text: "In Loomly, a reviewer's comment improves one post. In GoodSocials, a revise comment improves that post and updates one of three brand principles, so the fix applies to every later card. You can read the principles in settings and edit them by hand.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Loomly prices in tiers set by users and social accounts, with a free trial; check their pricing page for current rates. GoodSocials is $100 a month per LinkedIn profile and $1,000 for up to ${AGENCY_SEATS}.`,
      },
    ],
  },
  {
    slug: "easygen",
    name: "EasyGen",
    site: "easygen.io",
    category: "AI LinkedIn post generator",
    summary:
      "EasyGen writes LinkedIn posts in your style, informed by what top creators publish and what is trending, from a team with a large LinkedIn following of its own.",
    verdict:
      "Pick EasyGen if you want a fast writer for LinkedIn that learns from popular creators and trends, and you are happy to publish yourself. Pick GoodSocials if you want posts built from your own business, approved on a board and published on schedule.",
    rows: [
      {
        label: "Built for",
        them: "Creators and professionals writing LinkedIn posts",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The AI, from your topic, style and trending data",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "They change that post",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "You review each post as you generate it",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Content calendar; check their site for how posts go live",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "A single monthly plan, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You want posts shaped by what is working for well-known LinkedIn creators.",
      "You want trending topics researched for you.",
      "You like generating a post on demand when an idea strikes.",
    ],
    chooseUs: [
      "You want posts grounded in your own business.",
      "You want a queue that fills itself and publishes daily.",
      "You want invented numbers caught before they reach your feed.",
    ],
    blocks: [
      { type: "h2", text: "A writer tuned to LinkedIn" },
      {
        type: "p",
        text: "EasyGen was built by a creator with a large LinkedIn audience, and its writer reflects that experience. It studies what top creators publish, finds trending topics, and writes posts in your style. There is a content calendar and a free trial. For people who want strong LinkedIn posts on demand, it is a focused tool.",
      },
      { type: "h2", text: "Two sources of ideas" },
      {
        type: "p",
        text: "EasyGen looks outward, to creators and trends, for what to write. GoodSocials looks inward, to your website, your four themes and, if you connect them, your Stripe, GitHub, PostHog, Plausible or Notion numbers. Both are valid. The outward approach tends to produce posts that feel familiar in the feed. The inward one tends to produce posts only you could publish.",
      },
      {
        type: "p",
        text: "Because GoodSocials leans on real figures, it checks them. A quality gate reviews every post for invented numbers, unsupported claims and posts that say nothing, and holds any that fail with the reason shown.",
      },
      { type: "h2", text: "From draft to feed" },
      {
        type: "p",
        text: "GoodSocials handles the steps after writing. Approved cards get an image, pass the gate and land on the calendar, one per day, published at 09:00 in your timezone. Your revise comments update your brand principles along the way. The dashboard shows posts published this month and your streak.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "EasyGen has a single monthly plan with a free trial; check their pricing page for the current figure. GoodSocials is $100 a month for one profile, including images and publishing.",
      },
    ],
  },
  {
    slug: "contentin",
    name: "ContentIn",
    site: "contentin.io",
    category: "AI LinkedIn ghostwriter",
    summary:
      "ContentIn learns your voice from your past LinkedIn posts, plans and drafts new ones, schedules them through LinkedIn's official API and reports on how they did.",
    verdict:
      "Pick ContentIn if you want a lower-cost LinkedIn ghostwriter with analytics and company page support. Pick GoodSocials if you want daily cadence, posts that cite your own business numbers, and corrections that turn into rules.",
    rows: [
      {
        label: "Built for",
        them: "Founders and solopreneurs on LinkedIn",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn profiles and company pages",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The AI, trained on your past posts and an interview",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "Performance and edits feed back into drafts",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Planned drafts you review and schedule",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling via the official LinkedIn API",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiered monthly plans, custom agency plan",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You want a lower monthly cost for AI LinkedIn writing.",
      "You post to a company page as well as a personal profile.",
      "You want analytics on which angles perform.",
    ],
    chooseUs: [
      "You want to post close to daily.",
      "You want posts to cite real numbers from your own tools.",
      `You run up to ${AGENCY_SEATS} client profiles on one plan.`,
    ],
    blocks: [
      { type: "h2", text: "The closest cousin" },
      {
        type: "p",
        text: "ContentIn is near to GoodSocials in spirit. It is an AI ghostwriter for LinkedIn, it learns your voice from your past posts, it plans a set number of posts a week, publishes through LinkedIn's official API and shows you how they performed. It also supports company pages, which we do not. For a founder who wants a few good posts a week at a lower price, it is a fair choice.",
      },
      { type: "h2", text: "Where the approaches split" },
      {
        type: "p",
        text: "ContentIn starts from your past posts. LinkedIn does not let apps read those, so GoodSocials starts from your website instead, and you can add your archive later as reference on the calendar. The agent turns the site into four themes, which decide what the board is about.",
      },
      {
        type: "p",
        text: "The feedback loop is also different. ContentIn uses performance data to shape later drafts. GoodSocials uses your words. A revise comment rewrites the card and updates a written brand principle you can read and edit. You decide what the rule is.",
      },
      { type: "h2", text: "Cadence and proof" },
      {
        type: "list",
        items: [
          "The calendar holds one post per day, published at 09:00 in the board's timezone.",
          "Posts can cite figures from Stripe, GitHub, PostHog, Plausible and Notion, read only.",
          "A quality gate holds invented numbers and claims with nothing behind them.",
          "The dashboard leads with posts this month and your streak.",
        ],
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `ContentIn sells tiered monthly plans and a custom agency plan; check their pricing page for current figures. It costs less than GoodSocials. Our $100 a month covers daily cadence, images and the quality gate, and Agency covers up to ${AGENCY_SEATS} profiles for $1,000.`,
      },
    ],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    site: "chatgpt.com",
    category: "General purpose AI assistant",
    summary:
      "ChatGPT is a flexible, capable assistant that can draft a LinkedIn post, or almost anything else, in seconds, with memory and projects to carry context.",
    verdict:
      "Pick ChatGPT if you want a general assistant and are happy to prompt, copy, paste and post yourself. Pick GoodSocials if you want the steps around the writing handled: ideas, approvals, checks, images and publishing on a schedule.",
    rows: [
      {
        label: "Built for",
        them: "Anyone, for any writing or thinking task",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "None; you copy the text to LinkedIn yourself",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The model, from whatever you prompt",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "Kept in the chat, or in memory if you save them",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "You read the reply and decide",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Manual",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free tier, flat monthly plans, per seat for business",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "You already pay for it and post once in a while.",
      "You want one tool for posts, emails, research and everything else.",
      "You enjoy shaping the prompt and editing the result.",
    ],
    chooseUs: [
      "You have tried posting with ChatGPT and stopped after two weeks.",
      "You want a schedule that runs whether or not you open a chat.",
      "You want a check for invented numbers before anything is published.",
    ],
    blocks: [
      { type: "h2", text: "A great writer with no routine" },
      {
        type: "p",
        text: "ChatGPT can write a solid LinkedIn post. With project instructions and memory, it can hold your tone and preferences across chats. For many people it is the first tool they try, and for occasional posts it may be all they need.",
      },
      {
        type: "p",
        text: "What it does not have is a routine. Nothing asks you on Monday what goes out this week. The prompt, the copy and paste, the image, the timing and the posting are all yours to do, and that is usually where the habit breaks.",
      },
      { type: "h2", text: "What GoodSocials adds around the writing" },
      {
        type: "list",
        items: [
          "A board that fills itself from your website and four themes, and refills when the queue runs low.",
          "Approve, Revise and Reject on every card, where a revise comment updates your brand principles.",
          "A quality gate for invented numbers, unsupported claims and posts that say nothing.",
          "Generated images, up to 200 a month per profile.",
          "Publishing at 09:00 in your timezone, one post a day, with a streak to keep.",
        ],
      },
      { type: "h2", text: "Memory versus principles" },
      {
        type: "p",
        text: "ChatGPT's memory is broad and decides for itself what to keep. GoodSocials keeps three short principles per profile, voice, visual and format, and changes them only when you revise a card. You can open them in settings and read exactly what the writer is following. For an agency running a dozen clients, that separation per profile matters.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "ChatGPT has a free tier, flat monthly plans for individuals and per-seat plans for teams; check their pricing page for current plans. GoodSocials costs more at $100 a month per profile, because it does the whole job from idea to published post.",
      },
    ],
  },
  {
    slug: "jasper",
    name: "Jasper",
    site: "jasper.ai",
    category: "AI workspace for marketing teams",
    summary:
      "Jasper is an AI workspace for marketing teams, with brand voice and knowledge applied across content and agents for campaigns, SEO and research.",
    verdict:
      "Pick Jasper if a marketing team produces content across channels and needs brand governance and campaign workflows. Pick GoodSocials if the task is a person's LinkedIn profile posting daily, written, approved and published without a team.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams producing content at scale",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "None directly; content for any channel",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "AI agents guided by brand voice and knowledge",
        us: "The agent, from your site, four themes and your own numbers",
      },
      {
        label: "What happens to your edits",
        them: "Brand voice and style guides are maintained by the team",
        us: "A revise comment rewrites the card and updates your brand principles",
      },
      {
        label: "Approval flow",
        them: "Team workflows and permissions on business plans",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Export to your own tools",
        us: "One post a day at 09:00 your time, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per seat for individuals, quoted business plans, free trial",
        us: `$100 a month per profile, $1,000 for up to ${AGENCY_SEATS}. 14 days free`,
      },
    ],
    chooseThem: [
      "A marketing team writes blogs, ads, emails and social posts for one brand.",
      "You need brand rules enforced across many writers and formats.",
      "You want campaign and SEO workflows as well as social posts.",
    ],
    chooseUs: [
      "The content is one person's LinkedIn, and there is no marketing team.",
      "You want the post published with no export step.",
      "You want brand rules that update themselves from your comments.",
    ],
    blocks: [
      { type: "h2", text: "Marketing infrastructure" },
      {
        type: "p",
        text: "Jasper has moved from a writing assistant to a workspace for marketing teams. Brand voice, style guides, audiences and product knowledge are stored once and applied across outputs. Agents handle jobs like SEO, personalisation and campaign content. For a team producing many formats for one brand, it keeps everyone on message.",
      },
      { type: "h2", text: "One profile, one job" },
      {
        type: "p",
        text: "GoodSocials is a much smaller tool. It does one thing: keep a LinkedIn profile posting close to daily. It does not write blogs or ads. In exchange, it covers the whole path for that one thing, from idea to published post, with no export step.",
      },
      { type: "h2", text: "Brand rules that write themselves" },
      {
        type: "p",
        text: "Both tools believe in stored brand rules. In Jasper, a team writes and maintains them. In GoodSocials, they start from your website and change when you revise a card. Say 'fewer adjectives' once, and the voice principle is updated for every card after. Three principles per profile, voice, visual and format, readable and editable in settings.",
      },
      {
        type: "p",
        text: "Posts also follow a fixed rule of their own: third person, naming the company, the customers and the source. Software wrote the post, so it should not claim to be you. That rule holds even over a revise comment.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: `Jasper sells per-seat plans for individuals and quoted plans for businesses, with a free trial; check their pricing page for current details. GoodSocials is $100 a month per profile, $1,000 for up to ${AGENCY_SEATS}, and $2,000 for Consultancy, where the founder sets it up with you and holds a weekly call.`,
      },
    ],
  },
];
