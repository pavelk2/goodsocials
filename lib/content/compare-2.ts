import type { Comparison } from "./types";

const LINKEDIN_OAUTH = {
  title: "LinkedIn (2025). LinkedIn 3-legged OAuth flow. Microsoft Learn.",
  url: "https://learn.microsoft.com/linkedin/shared/authentication/authorization-code-flow",
};

const LINKEDIN_ACCESS = {
  title: "LinkedIn (2025). Getting access to LinkedIn APIs. Microsoft Learn.",
  url: "https://learn.microsoft.com/linkedin/shared/authentication/getting-access",
};

export const COMPARISONS_2: Comparison[] = [
  {
    slug: "socialbee",
    name: "SocialBee",
    site: "socialbee.com",
    category: "Category-based social scheduler",
    summary:
      "SocialBee sorts posts into content categories that rotate through the week, recycles evergreen posts, and adds an AI copilot that proposes platforms, content pillars and posts [1][2].",
    verdict:
      "SocialBee suits a business that posts to several networks and wants evergreen content to rotate. GoodSocials suits a founder or agency whose channel is LinkedIn and who wants each correction to carry into later posts.",
    rows: [
      {
        label: "Built for",
        them: "Small businesses and agencies on several networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Ten networks, LinkedIn among them [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with AI generation on every plan [1]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Workspaces with more users on higher plans [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Category schedules with evergreen recycling [1][2]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by profiles and workspaces, 14-day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The business posts to several networks and wants one tool for all of them.",
      "Evergreen posts should come back around on a schedule.",
      "Comments, mentions and messages need handling in the same tool [1].",
    ],
    chooseUs: [
      "Every post should be new, with no recycling.",
      "A correction should change how the next post is written.",
      "Posts should cite figures from the business's own Stripe or Plausible.",
    ],
    blocks: [
      { type: "h2", text: "Categories and a copilot" },
      {
        type: "p",
        text: "SocialBee's core idea is the content category. Posts sit in categories such as tips or promotions. Categories can be bulk-scheduled to rotate through the week, and evergreen posts can be recycled [2]. The number of categories grows with the plan [1]. An AI copilot recommends platforms, groups ideas into content pillars and drafts posts [2]. Every plan also includes an inbox for comments, mentions and messages, plus analytics [1]. For a small business on several networks, this is a coherent system.",
      },
      { type: "h2", text: "Where the two tools differ" },
      {
        type: "p",
        text: "Both tools sort content by topic. SocialBee's categories exist to rotate and recycle. GoodSocials uses four themes per profile, written from the member's website at onboarding. Ideas are spread across the themes, so week four does not repeat week one. GoodSocials does not republish posts.",
      },
      {
        type: "p",
        text: "The larger difference comes after the first draft. In GoodSocials, a revise comment rewrites the card. It also updates one of three brand principles for the profile: voice, visual or format. Every later card is written against those principles. The SocialBee pages cited here describe editing generated posts [2]. They do not describe edits feeding into later drafts.",
      },
      { type: "h2", text: "Checks before publishing" },
      {
        type: "p",
        text: "Each GoodSocials card passes a quality gate before it can be scheduled. The gate looks for invented numbers, unsupported claims and empty posts. A held card shows the reason and a revise comment that fixes it. When a post needs a number only the author has, the card asks for it by name.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "SocialBee sells three standard plans and three agency plans, set by profiles and workspaces, with a 14-day free trial [1]. GoodSocials Agency costs $1,000 a month for up to 10 LinkedIn profiles. Each profile has its own board, principles and themes. Each client authorises their own profile, so the agency holds no passwords.",
      },
    ],
    references: [
      {
        title: "SocialBee (2026). Pricing.",
        url: "https://socialbee.com/pricing/",
      },
      {
        title:
          "SocialBee (2026). AI-powered social media copilot and strategy builder.",
        url: "https://socialbee.com/social-media-copilot/",
      },
    ],
  },
  {
    slug: "metricool",
    name: "Metricool",
    site: "metricool.com",
    category: "Analytics-first social planner",
    summary:
      "Metricool combines social analytics, ads management for Google, Facebook and TikTok, automated reports and a planner, with a free plan to start [1][2].",
    verdict:
      "Metricool suits an agency or marketer whose clients expect reports on social and ads results. GoodSocials suits a founder or consultant whose goal is a LinkedIn post most days, written by the agent and approved on a board.",
    rows: [
      {
        label: "Built for",
        them: "Marketers and agencies who report on social results",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Twelve or more social platforms, plus ads accounts [2]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with an AI assistant on every plan [1]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Post approval system on the Advanced plan [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Drag and drop planner with best time suggestions [2]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, then tiers by number of brands [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Clients expect monthly reports on reach, engagement and ads.",
      "The agency manages many brands and wants the price to follow brand count [1].",
      "Social analytics, ads and the inbox should sit in one dashboard [2].",
    ],
    chooseUs: [
      "The month is measured in posts published and the current streak.",
      "The account has no time set aside for writing.",
      "LinkedIn posts should draw on the business's own Stripe or Plausible figures.",
    ],
    blocks: [
      { type: "h2", text: "Analytics first" },
      {
        type: "p",
        text: "Metricool is built around measurement. It reports on social channels, tracks competitors, and manages Google, Facebook and TikTok ads from one dashboard [2]. A planner, an inbox and automated reports sit alongside [2]. Pricing follows the number of brands, which fits agencies [1]. The free plan covers one brand. It excludes LinkedIn and X, and LinkedIn arrives with the Starter plan [1].",
      },
      { type: "h2", text: "A different measure of progress" },
      {
        type: "p",
        text: "GoodSocials shows no charts of impressions or followers. The dashboard leads with posts published this month and the current streak. The reasoning is a hypothesis. For founders and consultants, the usual gap is too few posts, and a reach chart does not close that gap. No public data settles this.",
      },
      {
        type: "p",
        text: "The product is built around cadence. The agent keeps the board stocked with ideas across four themes. The calendar holds one post per day per profile. Each post publishes at 09:00 in the board's timezone. Metricool measures what performed. GoodSocials makes sure there is something to measure.",
      },
      { type: "h2", text: "Business numbers in the post" },
      {
        type: "p",
        text: "Metricool reads social and ads numbers. GoodSocials reads business numbers, read-only, from Stripe, GitHub, PostHog, Plausible and Notion. Those figures go into the posts as receipts and data breakdowns. When a post needs a number no connected tool holds, the card asks the author for it.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Metricool has a free plan and paid tiers set by brand count [1]. GoodSocials costs $100 a month per profile, or $1,000 for up to 10. The two can run side by side: GoodSocials for LinkedIn posting, a reporting tool for results.",
      },
    ],
    references: [
      {
        title: "Metricool (2026). Pricing.",
        url: "https://metricool.com/pricing/",
      },
      {
        title: "Metricool (2026). Social media management tool.",
        url: "https://metricool.com/",
      },
    ],
  },
  {
    slug: "agorapulse",
    name: "Agorapulse",
    site: "agorapulse.com",
    category: "Social inbox and publishing",
    summary:
      "Agorapulse centres on one inbox for comments and messages across networks, with publishing, reporting and optional listening for teams and agencies [1][2].",
    verdict:
      "Agorapulse suits a team that answers comments and messages across many networks every day. GoodSocials suits an agency whose job is keeping client LinkedIn profiles posting, with the drafts written by the agent.",
    rows: [
      {
        label: "Built for",
        them: "Social teams and agencies who publish and engage",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Eleven networks, LinkedIn among them [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with an AI writing assistant [1]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Approval routing from the Professional plan, multi-step on Custom [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Unlimited scheduled posts and content calendars [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per user per month, listening as an add-on, 30-day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The team works through comments and messages every day.",
      "Client approvals and reports are needed across many networks.",
      "Brand and competitor listening belongs in the same tool [2].",
    ],
    chooseUs: [
      "The client wants LinkedIn posting handled and answers replies personally.",
      "Each client's voice should improve from the agency's comments.",
      "The agency prices its service per profile and wants costs to match.",
    ],
    blocks: [
      { type: "h2", text: "Built around the inbox" },
      {
        type: "p",
        text: "Agorapulse's inbox gathers messages and organic comments from connected networks in one place [1]. Publishing, calendars, approvals and reports sit around it [1]. Listening tracks mentions of a brand, an industry and competitors [2]. It is sold as a separate add-on [1]. For community managers and agencies that handle engagement, the tool covers the whole job.",
      },
      { type: "h2", text: "Posting only" },
      {
        type: "p",
        text: "GoodSocials has no inbox. It does not reply to comments or send messages. A reply under a person's name should come from that person. GoodSocials covers the other half of a client retainer: the posts.",
      },
      {
        type: "p",
        text: "Each client profile gets its own board, four themes, three brand principles and a queue. The agency and the client read cards and approve, revise or reject them. Revisions update that profile's principles only, so one client's tone does not leak into another's.",
      },
      { type: "h2", text: "What an agency has to manage" },
      {
        type: "list",
        items: [
          "Each client authorises their own LinkedIn profile, so the agency holds no passwords.",
          "LinkedIn issues access tokens with a 60-day lifespan, and programmatic refresh is limited to a set of partners [3]. GoodSocials emails before expiry, shows a banner, and pauses scheduling if access lapses.",
          "Posts are written in the third person and name the company and the source. No post makes a first-person claim the client did not make.",
        ],
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Agorapulse charges per user per month, with a 30-day free trial and listening sold separately [1]. GoodSocials charges per LinkedIn profile: $100 a month for one, $1,000 a month for up to 10. Team members add no cost.",
      },
    ],
    references: [
      {
        title: "Agorapulse (2026). Pricing.",
        url: "https://www.agorapulse.com/pricing/",
      },
      {
        title: "Agorapulse (2026). Social media management software.",
        url: "https://www.agorapulse.com/",
      },
      LINKEDIN_OAUTH,
    ],
  },
  {
    slug: "sendible",
    name: "Sendible",
    site: "sendible.com",
    category: "Social media tool for agencies",
    summary:
      "Sendible is built for agencies, with client workspaces, password-free client onboarding, in-app approvals and unlimited users on every plan [1][2].",
    verdict:
      "Sendible suits an agency running many networks for many clients, with branded dashboards and reports. GoodSocials suits an agency that sells LinkedIn ghostwriting and wants the first drafts written by the agent.",
    rows: [
      {
        label: "Built for",
        them: "Agencies managing many clients across networks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Ten platforms, including LinkedIn and WordPress [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with an AI smart compose tool [2]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "In-app approvals and client dashboards [1][2]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling per client workspace [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by workspaces and profiles, unlimited users, 14-day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The agency runs every network for dozens of clients.",
      "White-label software and client dashboards under the agency's brand matter [2].",
      "The team writes the content and needs a place to manage it.",
    ],
    chooseUs: [
      "The agency sells LinkedIn ghostwriting and writing hours are the constraint.",
      "Each client's voice should improve from the team's corrections.",
      "A price per client profile fits a LinkedIn retainer.",
    ],
    blocks: [
      { type: "h2", text: "An agency tool from the start" },
      {
        type: "p",
        text: "Sendible organises clients into workspaces, each with its own profiles [1]. Client Connect lets clients link their social profiles without sharing login details [1]. A post can go to another user for approval before it publishes [1]. Every plan includes unlimited users [1]. White label is a paid add-on from the Elite plan [1]. For agencies with broad social retainers, the fit is good.",
      },
      { type: "h2", text: "For LinkedIn ghostwriting retainers" },
      {
        type: "p",
        text: "A different kind of agency sells LinkedIn posts for founders and executives. Its main cost is writing hours. GoodSocials moves the first draft to the agent. For each client profile, the agent reads the website, sets four themes and writes posts across them. The team reviews and corrects drafts in place of starting from a blank page.",
      },
      {
        type: "p",
        text: "Corrections are where the team's judgement accumulates. Each revise comment updates that client's voice, visual or format principle. After a month, the principles hold in writing what the team knows about the client. A reasonable expectation is that drafts then need less work. GoodSocials has no published data on how fast that happens.",
      },
      { type: "h2", text: "What the client sees" },
      {
        type: "p",
        text: "Clients authorise their own LinkedIn profile. LinkedIn access tokens last 60 days [3], so GoodSocials warns before expiry and pauses scheduling if access lapses. Every post passes a quality gate for invented numbers and unsupported claims. When a post needs a figure only the client knows, the card names it and waits.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Sendible prices by workspaces and profiles, with unlimited users and a 14-day free trial [1]. GoodSocials Agency costs $1,000 a month for up to 10 LinkedIn profiles. Consultancy costs $2,000 a month for up to 10, with setup by the founder and a weekly call.",
      },
    ],
    references: [
      {
        title: "Sendible (2026). Pricing.",
        url: "https://www.sendible.com/pricing",
      },
      {
        title: "Sendible (2026). Social media management tool for agencies.",
        url: "https://www.sendible.com/",
      },
      LINKEDIN_OAUTH,
    ],
  },
  {
    slug: "planable",
    name: "Planable",
    site: "planable.io",
    category: "Content collaboration and approvals",
    summary:
      "Planable makes review easy, with posts previewed as they will look on each platform, comments in context and approval levels from off to multi-level [1][2].",
    verdict:
      "Planable suits a team whose hard part is approval between staff, clients and legal, with the team writing the posts. GoodSocials suits a founder or agency whose hard part is the writing, with a writer that learns from each approval.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams and agencies with review-heavy workflows",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "Nine platforms, LinkedIn among them [2]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, with AI-assisted creation [2]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "Comments and suggestions stay on that post [2]",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Off, optional, required or multi-level approvals [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Scheduling after approval, feed and calendar views [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per workspace per month, first 50 posts free [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Posts pass through several reviewers before they go out.",
      "Clients need to comment on a preview that looks like the native feed [2].",
      "The team publishes across many networks and formats.",
    ],
    chooseUs: [
      "Review is quick, and writing the posts takes the week.",
      "Feedback should change future drafts as well as the current one.",
      "LinkedIn profiles are the whole engagement.",
    ],
    blocks: [
      { type: "h2", text: "Approvals done well" },
      {
        type: "p",
        text: "Planable is built around the moment a reviewer sees a post. Previews look like the native platforms, and feedback sits beside the content [2]. Approval can be off, optional or required. The Enterprise plan stacks steps in order, such as team lead, client and legal [1]. Pricing is per workspace, where a workspace is one client, brand or location [1]. For agencies that spend their time chasing sign-off, the tool removes that work.",
      },
      { type: "h2", text: "What an approval can teach" },
      {
        type: "p",
        text: "Both tools treat approval as central. They differ in what an approval does next. In Planable, a comment is a note on one post [2]. In GoodSocials, a revise comment rewrites the card and updates the brand principle it touches: voice, visual or format. The next card starts from the updated rule.",
      },
      {
        type: "p",
        text: "The expected effect over a few weeks is a change in the ratio of work. Early cards need frequent revision. Later cards should pass more often, since earlier corrections are now part of the principles. This is the design intent. GoodSocials has no published measurement of it yet.",
      },
      { type: "h2", text: "Three actions, five columns" },
      {
        type: "p",
        text: "Planable offers a workflow to configure. GoodSocials has a fixed one: Idea, Draft, Image, Scheduled, Posted, with Approve, Revise and Reject on every card. There is less to set up. A quality gate checks each card before it reaches Scheduled.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Planable charges per workspace per month. Analytics and a social inbox are paid add-ons, and the first 50 posts are free [1]. GoodSocials charges per LinkedIn profile, $100 a month, or $1,000 for up to 10, with writing included.",
      },
    ],
    references: [
      {
        title: "Planable (2026). Pricing.",
        url: "https://planable.io/pricing/",
      },
      {
        title:
          "Planable (2026). Collaboration-first social media management tool.",
        url: "https://planable.io/",
      },
    ],
  },
  {
    slug: "loomly",
    name: "Loomly",
    site: "loomly.com",
    category: "Brand content calendar",
    summary:
      "Loomly pairs a clear calendar and approval workflows with post ideas from holidays, RSS feeds and custom lists, plus media storage for brand assets [1][2].",
    verdict:
      "Loomly suits a marketing team that plans content across networks and wants ideas, approvals and assets in one calendar. GoodSocials suits a founder or agency that wants LinkedIn posts written from the business itself, ready to approve.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams and agencies planning brand content",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "The major networks, LinkedIn among them [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The team, from post ideas and AI post generation [1][2]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Approval workflows and roles, custom on the Beyond plan [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Calendar scheduling with best time to post [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Tiers by users and social accounts, free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "A team plans a brand calendar across networks and wants date-based prompts [2].",
      "The brand needs media storage and approvals in one place [1].",
      "Several people write, and roles decide who publishes.",
    ],
    chooseUs: [
      "Ideas should come from the business itself.",
      "The member wants finished drafts to approve.",
      "Corrections should carry into every later post.",
    ],
    blocks: [
      { type: "h2", text: "Ideas, calendar and approvals" },
      {
        type: "p",
        text: "Loomly gives a marketing team a calendar, approval workflows with roles, and media storage [1]. Its post ideas come from four sources: custom ideas, RSS feeds, dated events and holidays, and broad best practices [2]. Loomly describes these as starting points to review before use [2]. For a team that plans brand content across networks, it is a tidy home.",
      },
      { type: "h2", text: "Where the ideas come from" },
      {
        type: "p",
        text: "Loomly's ideas come mostly from outside the business: dates, feeds and general practice [2]. GoodSocials' ideas come from inside it. At sign up, the agent reads the member's website and writes four themes, the topics the profile should be known for. Ideas are spread across those themes. Each idea gets a kind: a framework, a data breakdown, a receipt or a finding.",
      },
      {
        type: "p",
        text: "Stripe, GitHub, PostHog, Plausible or Notion can be connected with a read-only key. Their figures feed the ideas too. A receipt post can cite revenue or shipped work. When the number exists only in the author's head, the card asks for it, and the draft leaves a bracket in its place.",
      },
      { type: "h2", text: "Feedback that persists" },
      {
        type: "p",
        text: "In Loomly, a reviewer's comment improves one post. In GoodSocials, a revise comment improves that post and updates one of three brand principles. The fix then applies to every later card. The principles are readable and editable in settings.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Loomly prices in tiers by users and social accounts, with a free trial [1]. GoodSocials costs $100 a month per LinkedIn profile and $1,000 for up to 10.",
      },
    ],
    references: [
      {
        title: "Loomly (2026). Pricing.",
        url: "https://www.loomly.com/pricing",
      },
      {
        title:
          "Loomly (2026). What are social media post ideas? Definition and sources.",
        url: "https://www.loomly.com/blog/social-media-post-ideas-definition",
      },
    ],
  },
  {
    slug: "easygen",
    name: "EasyGen",
    site: "easygen.io",
    category: "AI LinkedIn post generator",
    summary:
      "EasyGen writes LinkedIn posts in the member's style, drawing on data from top creators and a trending topic search, built by a creator with over 100 million LinkedIn views [1].",
    verdict:
      "EasyGen suits a creator who wants a fast LinkedIn writer informed by popular posts and trends, and who publishes by hand. GoodSocials suits a founder who wants posts built from the business, approved on a board and published on schedule.",
    rows: [
      {
        label: "Built for",
        them: "Creators and professionals writing LinkedIn posts",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The AI, from creator data, trends and a style setting [1]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "The edit changes that post",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "The author reviews each post as it is generated",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Content calendar; no automatic posting, by design [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Subscription after a 7-day trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "Posts should be shaped by what works for well-known LinkedIn creators [1].",
      "Trending topics should be researched inside the writing tool [1].",
      "The author prefers to press publish on LinkedIn personally [1].",
    ],
    chooseUs: [
      "Posts should be grounded in the business itself.",
      "The queue should fill itself and publish daily.",
      "Invented numbers should be caught before they reach the feed.",
    ],
    blocks: [
      { type: "h2", text: "A writer tuned to LinkedIn" },
      {
        type: "p",
        text: "EasyGen's founder built it after more than 100 million LinkedIn views [1]. The writer uses data from what EasyGen calls the top 1% of creators [1]. A tool named EasyTrend searches Reddit, X, Google and other sources for trending topics [1]. A style setting adapts tone, and a content calendar tracks drafts [1]. For creators who want LinkedIn posts on demand, the tool is focused.",
      },
      { type: "h2", text: "Two sources of ideas" },
      {
        type: "p",
        text: "EasyGen looks outward, to creators and trends. GoodSocials looks inward, to the member's website, four themes and any connected Stripe, GitHub, PostHog, Plausible or Notion figures. Both approaches are reasonable. A plausible trade-off: outward ideas read as familiar in the feed, and inward ideas are harder for other accounts to copy. No public study compares the two.",
      },
      {
        type: "p",
        text: "Because GoodSocials leans on real figures, it checks them. A quality gate reviews every post for invented numbers, unsupported claims and empty posts. A post that fails is held, with the reason shown.",
      },
      { type: "h2", text: "Publishing by hand or by schedule" },
      {
        type: "p",
        text: "EasyGen does not post automatically. It states that automatic posting hurts reach [1]. LinkedIn offers an open API permission for apps to post on a member's behalf [2]. LinkedIn has not published data showing that such posts reach fewer people, so the evidence for either view is thin. GoodSocials publishes through that official permission. Approved cards get an image, pass the gate and publish at 09:00 in the board's timezone, one per day.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "EasyGen offers a 7-day trial before a paid subscription [1]. GoodSocials costs $100 a month for one profile, with images and publishing included.",
      },
    ],
    references: [
      {
        title: "EasyGen (2026). EasyGen: AI to write LinkedIn posts.",
        url: "https://easygen.io/",
      },
      LINKEDIN_ACCESS,
    ],
  },
  {
    slug: "contentin",
    name: "ContentIn",
    site: "contentin.io",
    category: "AI LinkedIn ghostwriter",
    summary:
      "ContentIn trains a personal model on the member's own LinkedIn posts, plans a set number of posts each week, publishes through LinkedIn's official API and reports on results [1].",
    verdict:
      "ContentIn suits a founder who wants two or three AI-written LinkedIn posts a week at a lower price, with analytics and company pages. GoodSocials suits a founder or agency that wants daily cadence, posts that cite business numbers, and corrections that become written rules.",
    rows: [
      {
        label: "Built for",
        them: "Founders and solopreneurs on LinkedIn [1]",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "LinkedIn profiles, company pages on the Pro plan [1]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The AI, trained on past posts and a ten-minute interview [1]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "Edits and published posts feed back into the model [1]",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "A planned week to review, approval flows on the agency plan [1]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Two or three planned posts a week, via the official API [1]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Two self-serve tiers, custom agency plan [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "A lower monthly cost matters more than daily cadence [1].",
      "The member posts to a company page as well as a personal profile [1].",
      "Analytics on which angle performed should guide the next draft [1].",
    ],
    chooseUs: [
      "The goal is posting close to daily.",
      "Posts should cite real numbers from the business's own tools.",
      "An agency runs up to 10 client profiles on one plan.",
    ],
    blocks: [
      { type: "h2", text: "The closest cousin" },
      {
        type: "p",
        text: "ContentIn is near GoodSocials in purpose. It is an AI ghostwriter for LinkedIn [1]. It trains on the member's past posts and an onboarding interview [1]. It plans two or three posts a week, depending on plan [1]. It publishes through LinkedIn's official API and shows post analytics [1]. Its Pro plan manages company pages, which GoodSocials does not [1]. For a founder who wants a few posts a week at a lower price, it is a fair choice.",
      },
      { type: "h2", text: "Where the approaches split" },
      {
        type: "p",
        text: "ContentIn starts from past posts. LinkedIn's open API permissions cover sign-in and posting, and the list includes no permission to read a member's post history [2]. GoodSocials therefore starts from the member's website. The agent turns the site into four themes, which decide what the board is about. Past posts can be added later from the LinkedIn data archive, which lists each shared post with its date and URL [3]. They appear on the calendar as reference.",
      },
      {
        type: "p",
        text: "The feedback loops differ too. ContentIn says edits and published posts feed back into its model [1]. GoodSocials uses the author's words. A revise comment rewrites the card and updates a written brand principle. The principle can be read and edited, so the author decides what the rule says.",
      },
      { type: "h2", text: "Cadence and proof" },
      {
        type: "list",
        items: [
          "The calendar holds one post per day, published at 09:00 in the board's timezone.",
          "Posts can cite figures from Stripe, GitHub, PostHog, Plausible and Notion, read-only.",
          "A quality gate holds invented numbers and unsupported claims.",
          "The dashboard leads with posts this month and the current streak.",
        ],
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "ContentIn sells two self-serve tiers and a custom agency plan [1]. Both self-serve tiers cost less than GoodSocials Pro [1]. GoodSocials Pro costs $100 a month and covers daily cadence, images and the quality gate. Agency covers up to 10 profiles for $1,000.",
      },
    ],
    references: [
      {
        title: "ContentIn (2026). ContentIn: AI ghostwriter for LinkedIn.",
        url: "https://contentin.io/",
      },
      LINKEDIN_ACCESS,
      {
        title: "LinkedIn Help (2026). 'Download your data'.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1339364",
      },
    ],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    site: "chatgpt.com",
    category: "General purpose AI assistant",
    summary:
      "ChatGPT is a flexible assistant that can draft a LinkedIn post, or most other text, with memory and projects to carry context between chats [2][3].",
    verdict:
      "ChatGPT suits a writer who wants one general assistant and is content to prompt, copy, paste and post by hand. GoodSocials suits a founder or agency that wants the steps around the writing handled: ideas, approvals, checks, images and scheduled publishing.",
    rows: [
      {
        label: "Built for",
        them: "General writing and thinking tasks",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "No built-in publishing; text goes to LinkedIn by copy and paste or a connector",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "The model, from whatever the prompt asks",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "Kept in the chat, or in memory when ChatGPT judges it relevant [2]",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "The writer reads the reply and decides",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Manual",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Free plan, individual plans, per-user business plans [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "The author already pays for it and posts once in a while.",
      "One tool should cover posts, emails, research and other work.",
      "The author enjoys shaping the prompt and editing the result.",
    ],
    chooseUs: [
      "Posting with ChatGPT started well and stopped after two weeks.",
      "The schedule should run whether or not a chat is opened.",
      "Invented numbers should be caught before a post is published.",
    ],
    blocks: [
      { type: "h2", text: "A capable writer with no routine" },
      {
        type: "p",
        text: "ChatGPT can write a solid LinkedIn post. Projects keep related chats, files and instructions together [3]. Memory carries preferences across chats [2]. For many people it is the first tool they try, and for occasional posts it may be enough.",
      },
      {
        type: "p",
        text: "It has no posting routine for LinkedIn. ChatGPT does not prompt the author on Monday about what goes out this week. The prompt, the copy and paste, the image, the timing and the posting stay manual. A likely explanation for lapsed habits is this chain of small steps. The evidence for that is anecdotal.",
      },
      {
        type: "p",
        text: "An app that posts to a member's feed needs the member to grant LinkedIn's w_member_social permission [4]. GoodSocials holds that grant for each profile and publishes on schedule.",
      },
      { type: "h2", text: "What GoodSocials adds around the writing" },
      {
        type: "list",
        items: [
          "A board that fills itself from the member's website and four themes, and refills when the queue runs low.",
          "Approve, Revise and Reject on every card, where a revise comment updates the brand principles.",
          "A quality gate for invented numbers, unsupported claims and empty posts.",
          "Generated images, up to 200 a month per profile.",
          "Publishing at 09:00 in the board's timezone, one post a day, with a streak on the dashboard.",
        ],
      },
      { type: "h2", text: "Memory and principles" },
      {
        type: "p",
        text: "ChatGPT's memory does not keep every detail, and ChatGPT decides which information is relevant to a response [2]. GoodSocials keeps three short principles per profile: voice, visual and format. They change only when a card is revised. Members of the account can open them in settings and read what the writer follows. For an agency running ten clients, that separation per profile matters.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "ChatGPT has a free plan, individual plans and per-user business plans [1]. GoodSocials costs more, at $100 a month per profile, because it covers the whole path from idea to published post.",
      },
    ],
    references: [
      {
        title: "OpenAI (2026). Pricing. ChatGPT Learn.",
        url: "https://learn.chatgpt.com/docs/pricing",
      },
      {
        title: "OpenAI Help Center (2026). Memory in ChatGPT.",
        url: "https://help.openai.com/en/articles/8590148-memory-faq",
      },
      {
        title: "OpenAI Help Center (2026). Projects in ChatGPT.",
        url: "https://help.openai.com/en/articles/10169521-projects-in-chatgpt",
      },
      {
        title: "LinkedIn (2023). Share on LinkedIn. Microsoft Learn.",
        url: "https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/share-on-linkedin",
      },
    ],
  },
  {
    slug: "jasper",
    name: "Jasper",
    site: "jasper.ai",
    category: "AI workspace for marketing teams",
    summary:
      "Jasper is an agent workspace for marketing teams, applying brand voice, style guides and product knowledge across outputs, with agents for SEO, campaigns and research [1][2].",
    verdict:
      "Jasper suits a marketing team that produces content across channels and needs brand governance and campaign workflows. GoodSocials suits one person's LinkedIn profile, or ten clients' profiles, posting daily without a marketing team.",
    rows: [
      {
        label: "Built for",
        them: "Marketing teams producing content at scale [2]",
        us: "Founders and consultants on LinkedIn, and agencies running their profiles",
      },
      {
        label: "Networks",
        them: "No network of its own; content for any channel [2]",
        us: "LinkedIn personal profiles only",
      },
      {
        label: "Who writes the posts",
        them: "AI agents guided by brand voice and knowledge [2]",
        us: "The agent, from the member's site, four themes and business numbers",
      },
      {
        label: "What happens to an edit",
        them: "Brand voices and style guides maintained by the team [1]",
        us: "A revise comment rewrites the card and updates the brand principles",
      },
      {
        label: "Approval flow",
        them: "Team workflows and governance controls [2]",
        us: "Idea, Draft, Image, Scheduled, Posted. Approve, Revise or Reject",
      },
      {
        label: "Publishing",
        them: "Content pipelines from idea to launch [2]",
        us: "One post a day at 09:00 in the board's timezone, after a quality gate",
      },
      {
        label: "Pricing model",
        them: "Per seat on Pro, custom Business plans, 7-day free trial [1]",
        us: "$100 a month per profile, $1,000 for up to 10. 7 days free",
      },
    ],
    chooseThem: [
      "A marketing team writes blogs, ads, emails and social posts for one brand.",
      "Brand rules must hold across many writers and formats [2].",
      "Campaign, SEO and research workflows matter as much as social posts [2].",
    ],
    chooseUs: [
      "The content is one person's LinkedIn, and there is no marketing team.",
      "The post should publish with no export step.",
      "Brand rules should update from revise comments.",
    ],
    blocks: [
      { type: "h2", text: "Marketing infrastructure" },
      {
        type: "p",
        text: "Jasper describes itself as an agent workspace for marketing teams [2]. Brand voice, style guides, audience profiles and product knowledge are stored once and applied across outputs [2]. Agents handle SEO, personalisation and campaign work [2]. The Business plan adds unlimited voices, style guides and custom agents [1]. For a team producing many formats for one brand, it keeps output on message.",
      },
      { type: "h2", text: "One profile, one job" },
      {
        type: "p",
        text: "GoodSocials is a much smaller tool. It does one thing: keep a LinkedIn profile posting close to daily. It does not write blogs or ads. In exchange, it covers the whole path for that one job, from idea to published post, with no export step.",
      },
      { type: "h2", text: "Brand rules that update from comments" },
      {
        type: "p",
        text: "Both tools store brand rules. In Jasper, a team writes and maintains brand voices and style guides [1]. In GoodSocials, the rules start from the member's website and change when a card is revised. A comment such as 'fewer adjectives' updates the voice principle for every later card. There are three principles per profile, voice, visual and format, readable and editable in settings.",
      },
      {
        type: "p",
        text: "Posts also follow a fixed rule of their own. They are written in the third person and name the company, the customers and the source. Software wrote the post, so it makes no first-person claim for the author. That rule holds even over a revise comment.",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "p",
        text: "Jasper sells a per-seat Pro plan and custom Business plans, with a 7-day free trial [1]. GoodSocials costs $100 a month per profile and $1,000 for up to 10. Consultancy costs $2,000 a month, with setup by the founder and a weekly call.",
      },
    ],
    references: [
      {
        title: "Jasper (2026). Pricing.",
        url: "https://www.jasper.ai/pricing",
      },
      {
        title: "Jasper (2026). The agent workspace for marketing teams.",
        url: "https://www.jasper.ai/",
      },
    ],
  },
];
