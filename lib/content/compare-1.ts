import type { Comparison } from "./types";

export const COMPARISONS_1: Comparison[] = [
  {
    slug: "buffer",
    name: "Buffer",
    site: "buffer.com",
    category: "Scheduler for many networks",
    summary:
      "Buffer schedules posts to a long list of networks, has a free plan for up to three channels, and bills per channel [1].",
    verdict:
      "Buffer suits a person who writes their own posts and queues them across several networks. GoodSocials suits a person who wants LinkedIn posts written for them and only approves them.",
    rows: [
      {
        label: "Built for",
        them: "Creators and small businesses posting to several networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn, Instagram, Facebook, TikTok, Threads, Bluesky, X and more [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The account owner, with an optional AI assistant on every plan [2]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Content approval workflows on the Team plan [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "A queue per channel, at times the owner picks",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan for three channels, then paid per channel [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The team posts to three or more networks and wants one queue.",
      "The posts already exist and only need a schedule.",
      "A free plan, or a bill that grows one channel at a time, fits the budget.",
    ],
    chooseUs: [
      "LinkedIn is the one network that matters, and the profile has gone quiet.",
      "The owner would rather approve seven finished posts than write one.",
      "A correction should hold for every later post, so the same mistake does not return.",
    ],
    blocks: [
      { type: "h2", text: "What Buffer does well" },
      {
        type: "p",
        text: "Buffer connects to Instagram, Facebook, TikTok, LinkedIn, X, YouTube, Threads, Pinterest, Bluesky, Mastodon and more [1]. The free plan covers up to three channels [1]. Paid plans bill per channel, so cost follows the number of accounts [1]. Every plan includes an AI assistant that brainstorms ideas and rewrites posts, and it is optional [1] [2]. The Team plan adds content approval workflows [1]. For a post that already exists, Buffer is a sound place to queue it.",
      },
      { type: "h2", text: "Where the work starts" },
      {
        type: "p",
        text: "Buffer starts from a post the owner has written. GoodSocials starts one step earlier. The member pastes a website URL. The agent drafts four themes from the site and seven posts across them. The posts land on a board with five columns. Each card has three actions: Approve, Revise, Reject.",
      },
      {
        type: "p",
        text: "The main difference is what a correction does. A revise comment such as 'shorter openings, no questions' rewrites that card. It also updates the matching brand principle, so later cards follow the rule. The practical effect, as GoodSocials designs it, is fewer revisions over the weeks.",
      },
      { type: "h2", text: "One network or many" },
      {
        type: "p",
        text: "Buffer covers many networks. GoodSocials covers one. A team that needs Instagram or TikTok is better served by Buffer. A person read mainly on LinkedIn may prefer a tool built for that one feed. GoodSocials adds a quality gate for invented numbers, optional figures from Stripe or GitHub, and one post a day at 09:00 in the board's timezone.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Buffer charges per connected channel and keeps a free plan [1]. Current rates are on its pricing page. GoodSocials costs $100 a month for one LinkedIn profile, writing included. The two can run side by side: GoodSocials for LinkedIn, Buffer for the other networks.",
      },
    ],
    references: [
      { title: "Buffer (2026). Pricing.", url: "https://buffer.com/pricing" },
      {
        title: "Buffer (2026). AI Assistant.",
        url: "https://buffer.com/ai-assistant",
      },
    ],
  },
  {
    slug: "hootsuite",
    name: "Hootsuite",
    site: "hootsuite.com",
    category: "Social media suite for teams",
    summary:
      "Hootsuite combines scheduling, a shared inbox, listening and reporting across the major networks, sold per user [1].",
    verdict:
      "Hootsuite suits a team running a brand across many networks that needs an inbox, listening and reports. GoodSocials suits one person, or an agency with up to ten client profiles, that needs LinkedIn posts written and published daily.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams managing brand accounts across networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Facebook, Instagram, LinkedIn, Threads, X, TikTok and YouTube [2]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with the Wisdom AI assistant on every plan [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Team review and approval from the Advanced plan up [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling across connected networks",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per user, tiers by feature, free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The team answers comments and messages across several networks from one inbox.",
      "Leadership asks for listening and performance reports as well as a schedule.",
      "Several people publish and need roles and approvals.",
    ],
    chooseUs: [
      "A person's LinkedIn profile is the channel, and the team has little time to write for it.",
      "The owner wants a board of finished posts to approve, in place of a blank composer.",
      "Success is counted in posts published this month.",
    ],
    blocks: [
      { type: "h2", text: "A suite for brand accounts" },
      {
        type: "p",
        text: "Hootsuite is built for a social team looking after a brand. It connects to Facebook, Instagram, LinkedIn, Threads, X, TikTok and YouTube [2]. Its plans include one inbox for messages, brand and competitor monitoring on higher tiers, and custom reports [1]. An AI assistant called Wisdom is in every plan [1]. For a team that manages several networks, it covers most of the daily work.",
      },
      { type: "h2", text: "What GoodSocials leaves out" },
      {
        type: "p",
        text: "GoodSocials has no inbox. It does not reply to comments, read the feed or chart impressions. That is a real gap when engagement is the job, and Hootsuite fills it. GoodSocials does one narrow thing: it keeps a person's LinkedIn profile posting close to daily.",
      },
      {
        type: "list",
        items: [
          "At sign up, the agent writes seven posts from the member's website, spread across four themes.",
          "Each card is approved, revised or rejected. A revise comment also updates the voice, visual or format principle.",
          "A quality gate holds any post with an invented number or an unsupported claim.",
          "The dashboard leads with posts published this month and the current streak.",
        ],
      },
      { type: "h2", text: "Brand accounts and people" },
      {
        type: "p",
        text: "Hootsuite handles brand handles and company pages. GoodSocials posts only to personal LinkedIn profiles. Its posts are written in the third person by rule, naming the company and the source. Software wrote them, and a first-person claim would describe work no person did.",
      },
      { type: "h2", text: "Cost and fit" },
      {
        type: "p",
        text: "Hootsuite sells plans per user, and offers a free trial [1]. Current rates are on its plans page. A bill priced per seat grows with the team. GoodSocials has no seat charge. It costs $100 a month per LinkedIn profile, or $1,000 a month for up to 10 profiles on Agency.",
      },
    ],
    references: [
      {
        title: "Hootsuite (2026). Plans.",
        url: "https://www.hootsuite.com/plans",
      },
      {
        title:
          "Hootsuite Help Center (2026). How Hootsuite works with social networks.",
        url: "https://help.hootsuite.com/s/article/how-hootsuite-works-with-social?language=en_US",
      },
    ],
  },
  {
    slug: "sprout-social",
    name: "Sprout Social",
    site: "sproutsocial.com",
    category: "Social media management for larger teams",
    summary:
      "Sprout Social pairs a Smart Inbox with post and profile reporting, approval workflows and optional listening, priced per seat [1] [2].",
    verdict:
      "Sprout Social suits a company with several people and networks that needs customer care and detailed reporting. GoodSocials suits one LinkedIn profile, or a set of client profiles, that needs posts written and published daily.",
    rows: [
      {
        label: "Built for",
        them: "Social, care and marketing teams in larger companies",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "X, Facebook, Instagram, LinkedIn, Threads, TikTok, Pinterest [2]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with AI assist in the composer on higher tiers [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Message approval workflow from the Professional plan [2]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar and scheduling across profiles",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per seat per month, tiers by feature, 30 day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Customer care runs through social and needs a shared inbox.",
      "Leadership wants reports on reach, sentiment and response.",
      "A team of specialists manages brand accounts on many networks.",
    ],
    chooseUs: [
      "The account that matters is a person's LinkedIn profile.",
      "The team lacks the hours to write a post a day.",
      "Corrections should become rules the writer follows from then on.",
    ],
    blocks: [
      { type: "h2", text: "Where Sprout Social is strongest" },
      {
        type: "p",
        text: "Sprout Social is broad. Its Smart Inbox gathers messages from each network into one place [2]. Reporting runs at group, profile and post level on every plan [2]. Listening is an add-on with sentiment tracking [1]. Approval workflows start on the Professional plan [2]. For a company with a social team and customer care on social, it is a strong choice.",
      },
      { type: "h2", text: "A different job" },
      {
        type: "p",
        text: "Sprout Social helps a team manage what the team creates. GoodSocials creates the posts. The agent reads the member's website at sign up. It writes four themes for what the profile should be known for, and puts seven posts on a board. It then keeps the board filled so the queue holds a few days of posts.",
      },
      {
        type: "p",
        text: "The difference is in feedback. A revise comment rewrites the card and updates one of three brand principles: voice, visual or format. The next card is written with the new rule. An approval workflow records what a reviewer said. GoodSocials turns the comment into an instruction the writer keeps.",
      },
      { type: "h2", text: "Business numbers, read only" },
      {
        type: "p",
        text: "Sprout Social reports on social numbers. GoodSocials reads business numbers, read only, from Stripe, GitHub, PostHog, Plausible or Notion with a pasted key. A post can then cite real revenue, merged pull requests or signups. When a post needs a figure only the author knows, the card asks for it. The quality gate holds figures that look invented.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Sprout Social charges per seat per month, with tiers that add features and a 30 day free trial [1]. Current rates are on its pricing page. GoodSocials has no seats. It costs $100 a month per LinkedIn profile, or $1,000 for up to 10.",
      },
    ],
    references: [
      {
        title: "Sprout Social (2026). Pricing.",
        url: "https://sproutsocial.com/pricing/",
      },
      {
        title: "Sprout Social (2026). Features.",
        url: "https://sproutsocial.com/features/",
      },
    ],
  },
  {
    slug: "later",
    name: "Later",
    site: "later.com",
    category: "Visual planner for social",
    summary:
      "Later offers a drag and drop visual planner, link in bio pages and an AI caption writer for the visual networks and LinkedIn [1].",
    verdict:
      "Later suits a brand whose content is photos and video for Instagram, TikTok and Pinterest. GoodSocials suits a person whose channel is LinkedIn and who would rather approve written posts than write them.",
    rows: [
      {
        label: "Built for",
        them: "Brands, creators and social teams with visual content",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Instagram, Facebook, TikTok, Threads, YouTube, Pinterest, LinkedIn, Snapchat [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The account owner, with an AI caption writer [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Content approval workflow on the Growth and Scale plans [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Drag and drop visual planner [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by social sets, users and posts per month, 14 day trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The content starts as photos and short video.",
      "The brand needs a link in bio page and a visual calendar.",
      "The visual networks come first and LinkedIn is a side channel.",
    ],
    chooseUs: [
      "LinkedIn is the main channel and the posts are words first.",
      "The team has little time to write the posts.",
      "Posts should cite the company's own figures from Stripe or PostHog.",
    ],
    blocks: [
      { type: "h2", text: "What Later is good at" },
      {
        type: "p",
        text: "Later is a planner for content that starts as images. Its Visual Planner places posts on a calendar by drag and drop [1]. Link in bio pages, which send visitors from a profile to any web page, and an AI caption writer come with every plan [1] [2]. It publishes to Instagram, Facebook, TikTok, Threads, YouTube, Pinterest, LinkedIn and Snapchat [1]. Plans are set by social sets, users and monthly post limits [1].",
      },
      { type: "h2", text: "Words first" },
      {
        type: "p",
        text: "LinkedIn is mostly read as text. GoodSocials writes four kinds of post: frameworks, data breakdowns, receipts and findings. The kind is chosen with the idea, so a receipt reads like a receipt from its first sentence. Images are generated to go with the text, up to 200 a month per profile. On the board, the image comes after the draft.",
      },
      { type: "h2", text: "How the board works" },
      {
        type: "steps",
        items: [
          "The member signs in with LinkedIn and pastes a website URL.",
          "The agent writes four themes and seven posts across them.",
          "Each card is approved, revised or rejected. A revise comment also updates the brand principles.",
          "Approved posts pass a quality gate and publish at 09:00 in the board's timezone, one a day.",
        ],
      },
      { type: "h2", text: "Pricing and fit" },
      {
        type: "p",
        text: "Later offers a 14 day free trial and no permanent free plan [1]. Current rates are on its pricing page. GoodSocials costs $100 a month for one LinkedIn profile, writing included. A company with a visual brand and a founder on LinkedIn could run both.",
      },
    ],
    references: [
      { title: "Later (2026). Pricing.", url: "https://later.com/pricing/" },
      {
        title: "Later (2026). Link in bio.",
        url: "https://later.com/link-in-bio/",
      },
    ],
  },
  {
    slug: "taplio",
    name: "Taplio",
    site: "taplio.com",
    category: "LinkedIn growth toolkit",
    summary:
      "Taplio puts an AI writer, a feed of viral posts, scheduling, analytics, engagement help and lead finding for LinkedIn in one tool [1].",
    verdict:
      "Taplio suits a person who works LinkedIn hands on: writing with AI, studying what performs, engaging and prospecting. GoodSocials suits a person who wants to spend a few minutes approving posts while writing, scheduling and publishing run on their own.",
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
        them: "The account owner, with an AI writer trained on 3 million+ posts [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Drafts and a queue the owner manages",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "A queue that posts at suggested times [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Monthly plans, 7 day free trial [2]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The owner enjoys writing on LinkedIn and wants AI help and examples while doing it.",
      "Analytics, engagement tools and lead finding are wanted in one place.",
      "Follower growth is the number being tracked.",
    ],
    chooseUs: [
      "The owner does not want to write, study viral posts or spend time in the feed.",
      "Posts should rest on the company's own numbers.",
      "The month is judged by how many days a post went out.",
    ],
    blocks: [
      { type: "h2", text: "A toolkit for doing LinkedIn by hand" },
      {
        type: "p",
        text: "Taplio is broad. Its AI writer is trained on more than 3 million posts, by its own account [1]. A daily feed ranks viral posts by niche [1]. There is a scheduler, post analytics and a carousel generator [1]. It also finds leads by title and industry and can send connection requests and messages [1]. For someone who treats LinkedIn as a daily practice, that is a lot of help in one place.",
      },
      { type: "h2", text: "Hands on or hands off" },
      {
        type: "p",
        text: "Taplio assumes the owner is at the desk. GoodSocials assumes the owner is not. The agent writes from the member's website and four themes, puts each post on a board, and waits. The member approves, revises or rejects. When fewer than three days of posts are scheduled, the board fills itself with new ideas.",
      },
      {
        type: "p",
        text: "Feedback is where the approaches part. In a general AI writer, a correction usually stays in one post. In GoodSocials, a revise comment updates the voice, visual or format principle. The rule then carries into every later card. The intended result is that week six sounds closer to the author than week one.",
      },
      { type: "h2", text: "Engagement is out of scope" },
      {
        type: "p",
        text: "GoodSocials does not write comments, send messages, join engagement pods or search for leads. When those are part of the plan, Taplio covers them and GoodSocials does not. GoodSocials stops at publishing: posts that pass a quality gate for invented numbers and empty claims, and a visible streak.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Taplio sells monthly plans with a 7 day free trial [2]. Current rates are on its pricing page. GoodSocials has one plan per profile at $100 a month, with writing, images and publishing included.",
      },
    ],
    references: [
      { title: "Taplio (2026). Home page.", url: "https://taplio.com/" },
      { title: "Taplio (2026). Pricing.", url: "https://taplio.com/pricing" },
    ],
  },
  {
    slug: "supergrow",
    name: "Supergrow",
    site: "supergrow.ai",
    category: "AI LinkedIn writer and scheduler",
    summary:
      "Supergrow is a low cost LinkedIn writer with voice matching, repurposing from video and documents, a carousel maker and team approvals [1] [2].",
    verdict:
      "Supergrow suits a person who wants an inexpensive AI writer for LinkedIn and is happy to drive it. GoodSocials suits a person who wants the writing to run on its own and corrections to become lasting rules.",
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
        them: "The owner prompts an AI matched to their voice [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Approval workflow on the Teams plan [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling with a calendar view [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per profile tiers, a Teams plan, 7 day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Budget is tight and the owner is willing to prompt the writer.",
      "Carousels and infographics are a large part of the LinkedIn mix.",
      "Posts start from a voice note, a video or a document the owner shapes.",
    ],
    chooseUs: [
      "A week of posts should appear without prompting.",
      "Feedback on one post should change how every later post is written.",
      "Posts should cite real numbers from the company's own tools, checked before they go out.",
    ],
    blocks: [
      { type: "h2", text: "What Supergrow offers" },
      {
        type: "p",
        text: "Supergrow is a LinkedIn writer at an entry price. A feature it calls Content DNA matches the owner's voice [1]. It turns voice notes, YouTube videos, articles and PDFs into posts [1] [2]. Higher tiers add a carousel maker and an infographic generator [1]. The Teams plan adds an approval workflow for up to four accounts [1]. That makes it a reasonable pick for a ghostwriter on a budget.",
      },
      { type: "h2", text: "Who drives" },
      {
        type: "p",
        text: "In Supergrow, the owner starts each post: a topic, a prompt, an edit, a slot. GoodSocials takes the first move. The website becomes four themes, and the themes become ideas. Ideas are spread across themes so no single one takes the board. Each idea gets a kind up front: framework, data breakdown, receipt or finding.",
      },
      {
        type: "p",
        text: "When a receipt needs a number only the author knows, the card names it and the draft leaves a bracket. The author fills it with a revise comment. The agent does not invent a figure to close the gap, and the quality gate holds a post that tries.",
      },
      { type: "h2", text: "Corrections that stay" },
      {
        type: "p",
        text: "Voice matching learns style from past writing. GoodSocials keeps three short brand principles per profile: voice, visual and format. Every revise comment updates the matching one. The principles are readable and editable in settings. The tone moves over the weeks, and the reason for each change is on record.",
      },
      { type: "h2", text: "Price and agency fit" },
      {
        type: "p",
        text: "Supergrow prices per profile in tiers, with a separate Teams plan [1]. Current rates are on its pricing page. It costs less than GoodSocials. The $100 a month pays for writing without prompts, the quality gate and corrections that persist. On the $1,000 Agency plan, up to 10 clients each authorise their own LinkedIn, so the agency does not hold a password.",
      },
    ],
    references: [
      {
        title: "Supergrow (2026). Pricing.",
        url: "https://www.supergrow.ai/pricing",
      },
      {
        title: "Supergrow (2026). Home page.",
        url: "https://www.supergrow.ai/",
      },
    ],
  },
  {
    slug: "authoredup",
    name: "AuthoredUp",
    site: "authoredup.com",
    category: "LinkedIn editor and analytics",
    summary:
      "AuthoredUp is a Chrome extension that adds formatting, previews, hook and ending templates, scheduling and analytics to LinkedIn [1].",
    verdict:
      "AuthoredUp suits a person who writes their own LinkedIn posts and wants better formatting, previews and analytics. GoodSocials suits a person who wants the posts written and whose part is approving them.",
    rows: [
      {
        label: "Built for",
        them: "People who write their own LinkedIn posts",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn profiles, company pages and groups [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The author, with 200+ hooks and 150+ ending templates [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "The post stays as the author wrote it",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Drafts kept inside the Chrome extension [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling from inside LinkedIn [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per profile per month, Business plan from 3 profiles [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The author likes writing and wants a stronger editor and preview.",
      "Detailed analytics on the author's own posts matter.",
      "The author wants to stay inside LinkedIn's interface.",
    ],
    chooseUs: [
      "The author has stopped writing and wants posts to go out anyway.",
      "Posting daily matters more than tuning each post's formatting.",
      "An agency manages several client profiles and needs one board per client.",
    ],
    blocks: [
      { type: "h2", text: "A better composer" },
      {
        type: "p",
        text: "AuthoredUp is a Chrome extension that works inside LinkedIn [1]. It adds bold, italic and list styles, a readability grade and a multi-device preview [1]. It ships a library of more than 200 hooks and 150 endings [1]. Analytics cover saves, sends, reach, profile views and followers gained [1]. For a person who already writes, it removes a lot of small friction.",
      },
      { type: "h2", text: "The writer and the editor" },
      {
        type: "p",
        text: "AuthoredUp makes writing easier. GoodSocials takes the writing off the author's desk. The two serve different people. One enjoys the craft and wants sharper tools. The other knows a post is due and has not written one in a month. For the first, AuthoredUp is the better buy.",
      },
      {
        type: "p",
        text: "For the second, the board is the whole product. Seven posts appear after the member pastes a URL. Each card has Approve, Revise and Reject. A revise comment such as 'less hedging, name the customer' rewrites the card. It also becomes part of the voice principle, so the note is not needed twice.",
      },
      { type: "h2", text: "Past posts, kept as reference" },
      {
        type: "p",
        text: "LinkedIn lets a member download a copy of their data. The Shares file lists each post with its date and link [2]. GoodSocials imports that file, and the old posts appear on the calendar beside the new ones. They are reference only and are not republished.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "AuthoredUp prices per profile per month, with a Business plan from three profiles and a free start with no card [1]. Current rates are on its pricing page. It costs far less than GoodSocials, because the author does the writing. The GoodSocials $100 a month covers writing, images, the quality gate and publishing for one profile.",
      },
    ],
    references: [
      {
        title: "AuthoredUp (2026). Pricing.",
        url: "https://authoredup.com/pricing",
      },
      {
        title: "LinkedIn Help (2026). 'Download your data'.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1339364",
      },
    ],
  },
  {
    slug: "typefully",
    name: "Typefully",
    site: "typefully.com",
    category: "Writing app for text-first networks",
    summary:
      "Typefully is a focused writing and scheduling app for X, LinkedIn, Threads, Bluesky, Mastodon and Instagram, with free accounts and paid team plans [1] [2].",
    verdict:
      "Typefully suits a person who writes their own posts and publishes to several text-first networks. GoodSocials suits a person for whom LinkedIn is the only network that matters and who wants the posts written and queued.",
    rows: [
      {
        label: "Built for",
        them: "Writers and founders posting to text-first networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "X, LinkedIn, Threads, Bluesky, Mastodon, Instagram [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The author, with an AI writing assistant [3]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Team roles on the Business plan [2]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling across connected networks",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free accounts, paid plans for teams [2]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The author writes every day and wants a calm editor.",
      "The same ideas go to X, Threads and Bluesky as well as LinkedIn.",
      "A free account or a low monthly cost fits the budget.",
    ],
    chooseUs: [
      "Writing is the step that keeps getting skipped.",
      "A week of LinkedIn posts should be ready to approve on Monday.",
      "Posts should carry real figures from Stripe, GitHub or PostHog.",
    ],
    blocks: [
      { type: "h2", text: "Why writers use Typefully" },
      {
        type: "p",
        text: "Typefully is a writing surface first. It schedules to X, LinkedIn, Threads, Bluesky, Mastodon and Instagram from one editor [1]. It offers an AI writing assistant [3]. The Business plan adds teams with read, write, publish and admin roles [2]. Members with free accounts can join a paid team [2]. For a founder who writes in public on several networks, it fits well.",
      },
      { type: "h2", text: "When the page stays blank" },
      {
        type: "p",
        text: "An editor helps only when someone opens it. GoodSocials is built for the weeks when it stays closed. It turns the member's website into four themes, writes posts across them, and lines them up on a board. The member's time goes into reading and deciding.",
      },
      {
        type: "list",
        items: [
          "Approve moves a card toward Scheduled.",
          "Revise takes a comment, rewrites the card and updates the matching brand principle.",
          "Reject removes the card and makes room for another idea.",
        ],
      },
      { type: "h2", text: "A post with a source" },
      {
        type: "p",
        text: "Typefully helps shape the author's words. GoodSocials can also supply the substance. With a read-only key for Stripe, GitHub, PostHog, Plausible or Notion, posts can cite this month's revenue, merged pull requests or signups. A quality gate checks every post for invented numbers and unsupported claims before it can be scheduled.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Typefully has free accounts and paid plans [2]. Current rates are on its pricing page. GoodSocials costs $100 a month for one LinkedIn profile, because the writing is the product. A founder who likes to write will likely be happier in Typefully.",
      },
    ],
    references: [
      { title: "Typefully (2026). Home page.", url: "https://typefully.com/" },
      {
        title: "Typefully Help Center (2026). Collaborating in teams.",
        url: "https://support.typefully.com/en/articles/8717333-collaborating-in-teams",
      },
      {
        title: "Typefully (2026). AI writing assistant.",
        url: "https://typefully.com/ai",
      },
    ],
  },
  {
    slug: "hypefury",
    name: "Hypefury",
    site: "hypefury.com",
    category: "Scheduling and growth automation",
    summary:
      "Hypefury pairs scheduling with automations such as Autoplugs, cross-posting and an engagement builder, on a per channel or flat plan [1] [2].",
    verdict:
      "Hypefury suits a creator on several networks who wants automations that promote an offer and reuse what worked. GoodSocials suits a person who wants LinkedIn posts written and published daily, with no automation in the comments.",
    rows: [
      {
        label: "Built for",
        them: "Creators and solo businesses growing an audience",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Bluesky, Threads, LinkedIn, Instagram, TikTok, Mastodon. X no longer supported [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The owner, with rewrite and evergreen tools [2]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "A queue the owner manages",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Queue, cross-posting and Autoplug comments [1] [2]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per channel or a flat plan, 7 day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The creator sells a product or newsletter and wants posts to promote it automatically.",
      "The same content goes to Instagram, Threads, Bluesky and TikTok as well as LinkedIn.",
      "A low monthly price matters and the owner writes the posts.",
    ],
    chooseUs: [
      "Automated comments under a client's name are a risk the agency will not take.",
      "The posts should be written for the owner.",
      "Each post should be checked for invented numbers before it goes out.",
    ],
    blocks: [
      { type: "h2", text: "Automation for creators" },
      {
        type: "p",
        text: "Hypefury grew a set of automations around a scheduler. Autoplugs are automatic comments that promote an offer, added only when a post performs well [2]. Cross-posting turns a post into Instagram images, reels, TikTok videos or LinkedIn carousels [2]. An engagement builder points to accounts to reply to [2]. Hypefury states that it no longer supports X [1].",
      },
      { type: "h2", text: "A quieter approach" },
      {
        type: "p",
        text: "GoodSocials does not automate activity around a post. It sends no comments, no DMs and no likes. It publishes one post a day to a personal LinkedIn profile and stops there. For consultants and agencies posting as a client, that restraint matters. A post goes out under a client's name only after an approval.",
      },
      { type: "h2", text: "The writing is the product" },
      {
        type: "p",
        text: "Hypefury helps distribute posts. GoodSocials writes them. The agent works from the member's website and four themes, and picks the kind of post with the idea. It writes in the third person, naming the company and the source. Revise comments update the brand principles, so later cards need fewer of them.",
      },
      {
        type: "p",
        text: "Every card passes a quality gate before it can be scheduled. The gate holds invented numbers, unsupported claims and posts without a point. It shows the reason, with a revise comment that fixes it.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Hypefury offers a per channel plan and a flat plan, each with a 7 day free trial [1]. Current rates are on its pricing page. It costs much less than GoodSocials, which charges $100 a month per LinkedIn profile with the writing included.",
      },
    ],
    references: [
      {
        title: "Hypefury (2026). Pricing.",
        url: "https://hypefury.com/pricing",
      },
      { title: "Hypefury (2026). Home page.", url: "https://hypefury.com/" },
    ],
  },
  {
    slug: "publer",
    name: "Publer",
    site: "publer.com",
    category: "Budget multi-network scheduler",
    summary:
      "Publer schedules to a wide list of networks, including Google Business, Telegram and WordPress, and has a free plan [1].",
    verdict:
      "Publer suits a person who schedules self-written posts to many networks for little money. GoodSocials suits one LinkedIn profile, or up to ten, that should post daily with the writing done.",
    rows: [
      {
        label: "Built for",
        them: "Small businesses and freelancers on a budget",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Major networks plus Google Business, Telegram and WordPress [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The owner, with an AI assistant [1]",
        us: "The agent, from the member's site, four themes and own numbers",
      },
      {
        label: "What happens to an edit",
        them: "It changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Approval workflows for added team members [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar, bulk scheduling and post recycling [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then priced by social accounts and members [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Many networks, including Telegram or Google Business, on a small budget.",
      "The owner batches content and wants bulk scheduling.",
      "A free plan covers the need for now.",
    ],
    chooseUs: [
      "Writing is the part that rarely finds a slot in the week.",
      "LinkedIn is the only channel that has to be right.",
      "A stable voice should build up from the author's own corrections.",
    ],
    blocks: [
      { type: "h2", text: "A lot of scheduler for little money" },
      {
        type: "p",
        text: "Publer is practical. It posts to a long list of networks, including Google Business, Telegram and WordPress [1]. Bulk scheduling takes up to 500 posts at once from a CSV file [1]. Post recycling reuses evergreen content [1]. An AI assistant helps draft [1]. There is a free plan, and paid plans are priced by social accounts and team members [1].",
      },
      { type: "h2", text: "Same week, different effort" },
      {
        type: "p",
        text: "Consider one week in each tool. In Publer, the owner writes five posts, perhaps asks the assistant for variations, and drops them into the calendar. In GoodSocials, the member opens the board on Monday and finds posts drafted from the themes. The member approves three, revises one with a comment and rejects one. The board refills.",
      },
      {
        type: "p",
        text: "The revise comment is where the tools differ most. It rewrites the card and updates the voice, visual or format principle. The next Monday's posts are written with that rule.",
      },
      { type: "h2", text: "The 60 day problem" },
      {
        type: "p",
        text: "LinkedIn access tokens last 60 days by default [2]. LinkedIn issues refresh tokens to approved Marketing Developer Platform partners [2]. For other apps, the member has to sign in again. A tool that does not track the date would keep accepting posts that cannot publish. GoodSocials emails before access expires, shows a banner, and pauses scheduling if it lapses.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Publer has a free plan and paid plans priced by social accounts and members [1]. Current rates are on its pricing page. It costs much less than GoodSocials. The $100 a month for one profile pays for the writing, the images and the checks.",
      },
    ],
    references: [
      { title: "Publer (2026). Plans.", url: "https://publer.com/plans" },
      {
        title:
          "LinkedIn, Microsoft Learn (2025). Refresh tokens with OAuth 2.0.",
        url: "https://learn.microsoft.com/linkedin/shared/authentication/programmatic-refresh-tokens",
      },
    ],
  },
];
