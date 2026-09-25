import type { Block } from "./types";
import { AGENCY_SEATS, IMAGE_CAP_PER_MONTH, SUPPORT } from "@/lib/legal";
import { PLANS, TRIAL_DAYS } from "@/lib/plans";

/**
 * The docs page, one section per thing a member asks about in the support
 * chat. Every number comes from the constant the product runs on, so a price
 * or a cap changed in code cannot leave this page saying the old one.
 */
export type DocSection = { id: string; title: string; blocks: Block[] };

const [pro, agency, consultancy] = PLANS;

export const DOCS: DocSection[] = [
  {
    id: "start",
    title: "Getting started",
    blocks: [
      {
        type: "p",
        text: "GoodSocials writes LinkedIn posts for a personal profile, shows them to you on a board, and publishes the ones you approve at the time you scheduled. Setup takes about five minutes.",
      },
      {
        type: "steps",
        items: [
          "Sign in with LinkedIn. One consent screen grants sign in and permission to post to your own feed. We never see your password.",
          "Paste your website URL. The agent reads it and writes four themes and three brand principles for your profile.",
          "Answer a few one-line questions: what posts should get you, how often you want to post, what kind of content fits you.",
          "Seven posts land on your board. Read them, approve one, and pick a plan.",
          "The approved post publishes to your feed at 09:00 in your time zone on the day it is scheduled for.",
        ],
      },
      {
        type: "p",
        text: `Every plan starts with ${TRIAL_DAYS} days free. Nothing publishes until a plan is running.`,
      },
    ],
  },
  {
    id: "board",
    title: "The board",
    blocks: [
      {
        type: "p",
        text: "The board has five columns. A card moves left to right as it gets closer to your feed.",
      },
      {
        type: "list",
        items: [
          "Idea: a one-line angle for a post, tied to one of your themes.",
          "Draft: the full text, written from the idea.",
          "Image: the draft with its image, ready to schedule.",
          "Scheduled: holds a day and a time. The publisher will post it then.",
          "Posted: live on LinkedIn, with a link to the post.",
        ],
      },
      {
        type: "p",
        text: "When the queue holds fewer than three days of scheduled posts, the board says so and the agent writes more ideas.",
      },
    ],
  },
  {
    id: "actions",
    title: "Approve, revise, reject",
    blocks: [
      {
        type: "p",
        text: "Every card has three actions and no others.",
      },
      {
        type: "list",
        items: [
          "Approve moves the card to its next column. On a finished post it schedules it in the next free slot.",
          "Revise takes a comment, rewrites the card to match it, and keeps the old version in the card's history.",
          "Reject takes the card off the board.",
        ],
      },
      {
        type: "p",
        text: "You can also drag cards between columns with a mouse or the keyboard.",
      },
    ],
  },
  {
    id: "principles",
    title: "Brand principles and revise comments",
    blocks: [
      {
        type: "p",
        text: "Each profile has three brand principles: voice (how posts sound), visual (how images look) and format (how posts are laid out). They are plain text you can edit on the board.",
      },
      {
        type: "p",
        text: "A revise comment does two things. It rewrites the card you commented on, and it updates the principle the comment is about. Write 'no questions as openers' on one card and every card written after it follows that rule. This is how the board gets closer to your voice each week without you repeating yourself.",
      },
      {
        type: "p",
        text: "Posts are written in the third person: the company, the product and the source are named, and no post says 'I' or 'we'. Software wrote the words, so a first person claim would be one nobody made. This rule holds even when a principle or a comment asks for the first person.",
      },
    ],
  },
  {
    id: "themes",
    title: "Themes",
    blocks: [
      {
        type: "p",
        text: "Four themes per profile decide what posts are about. Principles decide how a post sounds, themes decide what it may be about. They are written from your website at setup and you can edit them on the board at any time.",
      },
      {
        type: "p",
        text: "New ideas are spread across the four, so no single theme takes over the board and week four does not read like week one.",
      },
    ],
  },
  {
    id: "kinds",
    title: "Post kinds and the gaps only you can fill",
    blocks: [
      {
        type: "p",
        text: "Each idea is decided with its shape: a framework, a data breakdown, a receipt, or a finding. Most of the mix is frameworks, data and receipts, because those are the posts with something under them.",
      },
      {
        type: "p",
        text: "A receipt is credible because the number is yours. When a post needs a figure only you know, the card names it in a line under the text and the draft leaves a bracketed gap. Supply the number in a revise comment and the gap closes. The agent never invents it.",
      },
    ],
  },
  {
    id: "quality",
    title: "The quality check",
    blocks: [
      {
        type: "p",
        text: "Before any card can be scheduled, a quality check reads it for invented numbers, claims with nothing behind them, and posts that say nothing. A card that fails stays in the Image column with the reasons listed, and each reason comes with a revise comment that fixes it.",
      },
      {
        type: "p",
        text: "The publisher checks again right before posting, for anything that would look broken in the feed, and hands the card back to you instead of publishing it.",
      },
    ],
  },
  {
    id: "schedule",
    title: "Scheduling and the calendar",
    blocks: [
      {
        type: "p",
        text: "Posts publish at 09:00 in the board's time zone, never 09:00 UTC. The zone comes from your browser at setup and can be changed in settings. Cadence is 1 to 7 posts a week, set in settings, and the board holds at most one post per day per profile.",
      },
      {
        type: "p",
        text: "Open the calendar from the board to see the same cards by day. Drag a ready card onto a day to schedule it for that day. Drag a scheduled post back to the rail to take it out of the queue.",
      },
      {
        type: "p",
        text: "The publisher runs every 15 minutes. If LinkedIn refuses a post, the publisher retries it up to five times and keeps the reason.",
      },
    ],
  },
  {
    id: "images",
    title: "Images",
    blocks: [
      {
        type: "p",
        text: `Each profile can generate up to ${IMAGE_CAP_PER_MONTH} images a month. Regenerating an image counts as a new one. Settings shows how many you have used and when the count resets. At the cap the board tells you, and the image step waits until the next month.`,
      },
    ],
  },
  {
    id: "sources",
    title: "Your numbers: connecting sources",
    blocks: [
      {
        type: "p",
        text: "Posts with your own numbers in them are the hardest to fake and the easiest to trust. Open Integrations from settings and paste a read-only key for any of these:",
      },
      {
        type: "list",
        items: [
          "Stripe: revenue, new customers and churn over the last 30 days.",
          "GitHub: what shipped, counted from merged pull requests, commits and releases.",
          "PostHog: product usage and the visits your posts send to your site.",
          "Plausible: website visits, top pages and top sources.",
          "Notion: excerpts from the pages you share with the integration, so drafts start from your own words.",
        ],
      },
      {
        type: "p",
        text: "Sources sync once a day. A reading that stops coming back is removed, so no post cites last quarter's figure as current. Keys are encrypted at rest and never sent back to your browser.",
      },
    ],
  },
  {
    id: "history",
    title: "Importing your past posts",
    blocks: [
      {
        type: "p",
        text: "LinkedIn does not let any app read a member's past posts, so the calendar can show them only from your own copy of your data.",
      },
      {
        type: "steps",
        items: [
          "In LinkedIn, open Settings, then Data privacy, then Get a copy of your data.",
          "Pick Posts. LinkedIn emails you an archive, usually within minutes.",
          "In GoodSocials settings, under Posts already on LinkedIn, upload Shares.csv from the archive.",
        ],
      },
      {
        type: "p",
        text: "The most recent 300 are kept, for reference on the calendar. Nothing imported is ever posted again. Importing a newer archive later adds only the posts since.",
      },
    ],
  },
  {
    id: "reconnect",
    title: "Reconnecting LinkedIn every 60 days",
    blocks: [
      {
        type: "p",
        text: "LinkedIn gives apps like ours a 60 day connection with no way to renew it in the background. So every 60 days you sign in with LinkedIn once more. It takes one click.",
      },
      {
        type: "list",
        items: [
          "10 days before it expires, we email you.",
          "5 days before, the board shows a banner.",
          "If it expires, scheduling pauses for that profile. Posts keep their slots and publish once you reconnect, instead of failing one by one.",
        ],
      },
    ],
  },
  {
    id: "agency",
    title: "Running clients' profiles",
    blocks: [
      {
        type: "p",
        text: `The ${agency.name} and ${consultancy.name} plans hold up to ${AGENCY_SEATS} LinkedIn profiles. Each profile has its own board, themes, principles, image count and connection. Switch between them from the profile picker.`,
      },
      {
        type: "p",
        text: "Each client signs in with LinkedIn to connect their own profile, so you never hold a client's password. When a client's connection is close to expiring, the email comes to you.",
      },
    ],
  },
  {
    id: "billing",
    title: "Plans and billing",
    blocks: [
      {
        type: "list",
        items: PLANS.map(
          (plan) => `${plan.name}, ${plan.priceLine}: ${plan.line}`,
        ),
      },
      {
        type: "p",
        text: `Every plan starts with ${TRIAL_DAYS} days free. Checkout, card changes, plan changes and cancelling all happen in Stripe, opened from settings. Your card never reaches our servers. If a payment fails, posts keep publishing while Stripe retries the card. After you cancel, publishing stops at the end of the period you paid for.`,
      },
      {
        type: "p",
        text: `Start on ${pro.name} and move up from settings when you add a second profile.`,
      },
    ],
  },
  {
    id: "data",
    title: "Your data",
    blocks: [
      {
        type: "list",
        items: [
          "Download your data: settings gives you every profile, board, card, comment, principle, theme and scheduled post as one JSON file.",
          "Disconnect a profile: removes the LinkedIn connection and stops every scheduled post for it.",
          "Delete account: removes everything within 30 days, invoices excepted, and cancels the subscription that day.",
        ],
      },
      {
        type: "p",
        text: "What GoodSocials never does with LinkedIn access: read your feed, messages or connections, like or comment, send invitations, or post anything you did not approve. The privacy page has the full list.",
      },
    ],
  },
  {
    id: "limits",
    title: "What it does not do",
    blocks: [
      {
        type: "list",
        items: [
          "Company pages. LinkedIn gates that permission, so GoodSocials posts to personal profiles only.",
          "Other networks. LinkedIn only.",
          "Replies to comments, direct messages, engagement pods. The conversation under your post is yours.",
          "Impression and follower dashboards. The dashboard leads with posts published this month and your streak, because cadence is the part you control.",
        ],
      },
    ],
  },
  {
    id: "help",
    title: "Getting help",
    blocks: [
      {
        type: "p",
        text: `Use the chat in the corner of any page, or write to ${SUPPORT}. A person reads both.`,
      },
    ],
  },
];
