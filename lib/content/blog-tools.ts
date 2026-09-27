import type { BlogPost } from "./types";
import { AGENCY_SEATS, IMAGE_CAP_PER_MONTH } from "@/lib/legal";
import { PLANS, TRIAL_DAYS } from "@/lib/plans";

const PRO = PLANS.find((plan) => plan.slug === "pro")!;
const AGENCY = PLANS.find((plan) => plan.slug === "agency")!;

/** Commercial searches: which tool to use for LinkedIn posts, alternatives to named tools, prompts and exporting your own posts. */
export const TOOL_POSTS: BlogPost[] = [
  {
    slug: "best-ai-tools-for-linkedin",
    title: "Best AI tools for LinkedIn posts in 2026, sorted by job",
    description:
      "The best AI tools for LinkedIn posts in 2026, grouped by job: LinkedIn writers, growth toolkits, schedulers, chat models and managed approval queues.",
    date: "2026-09-27",
    readMinutes: 6,
    related: [
      "/compare/taplio",
      "/compare/supergrow",
      "/compare/chatgpt",
      "/compare/buffer",
    ],
    blocks: [
      {
        type: "p",
        text: "The best AI tool for LinkedIn posts is the one that removes the step you keep skipping. If you write but lose time on formatting and timing, pick an editor or a scheduler; if the writing is the problem, pick a tool that drafts for you; and if you stop after two weeks whatever you use, pick one that runs a queue without you opening it.",
      },
      {
        type: "p",
        text: "Below are the tools people compare most often, grouped by the job they do, with one fair line on each. What we say about other tools comes from their public sites, as of September 2026. Features and prices change, so check theirs before you decide.",
      },
      { type: "h2", text: "Name the job before you pick a tool" },
      {
        type: "p",
        text: "Most people shop for a LinkedIn tool by feature list and end up paying for ten things while the one thing that stopped them posting stays unsolved. Look at the last three months of your profile and ask where the posts died.",
      },
      {
        type: "list",
        items: [
          "No ideas. You open the composer and nothing comes.",
          "No time to write. You have ideas, but a good post takes you an hour.",
          "No polish. You write, but the formatting, the opening and the length never look right.",
          "No routine. You write in bursts, then nothing for a month.",
          "No reach beyond LinkedIn. You also need Instagram, Threads or X covered.",
        ],
      },
      {
        type: "p",
        text: "Each group of tools below solves one or two of these well. None of them solves all five.",
      },
      { type: "h2", text: "AI writers built for LinkedIn" },
      {
        type: "p",
        text: "These tools write LinkedIn posts with you. You start each one, pick a topic or give it material, and edit the result.",
      },
      {
        type: "list",
        items: [
          "Supergrow: an affordable LinkedIn writer that learns your writing style, builds carousels and visuals, and has a team plan with client approvals. Best if you are happy to prompt it yourself.",
          "EasyGen: writes posts in your style, shaped by what well-known LinkedIn creators publish and what is trending. Best for generating a post on demand when an idea strikes.",
          "ContentIn: an AI ghostwriter that learns your voice from your past posts and an interview, plans drafts, publishes through LinkedIn's official API and supports company pages. Best if you want a lower-cost ghostwriter with analytics.",
        ],
      },
      { type: "h2", text: "LinkedIn growth toolkits and editors" },
      {
        type: "p",
        text: "These are for people who treat LinkedIn as a daily practice and want help at the desk.",
      },
      {
        type: "list",
        items: [
          "Taplio: an AI writer trained on a large set of LinkedIn posts, a library of high-performing posts, a scheduler, analytics, help drafting comments and a lead database. Best if you work LinkedIn hands on and track follower growth.",
          "AuthoredUp: a browser extension that adds formatting, previews of the 'see more' cut, saved hooks, a library of your past posts and analytics to LinkedIn's own composer. Best if you like writing and want sharper tools for it.",
        ],
      },
      { type: "h2", text: "Schedulers for several networks, with AI help" },
      {
        type: "p",
        text: "These assume the post exists. They queue it for LinkedIn and your other networks, and most add an AI assistant for rewording and ideas.",
      },
      {
        type: "list",
        items: [
          "Buffer: a clear, calm scheduler with a free plan and per-channel pricing. Best if you write your own posts and publish to three or more networks.",
          "Typefully: a distraction-free writing and scheduling app for X, LinkedIn, Threads, Bluesky and Mastodon, with a free plan. Best for founders who write in public across text-first networks.",
          "Publer: a low-cost scheduler for a long list of networks, with bulk scheduling and recycling. Best on a tight budget.",
          "SocialBee: sorts posts into categories that rotate and recycle, with an AI copilot that drafts from your website. Best for a small business with evergreen content on several networks.",
        ],
      },
      {
        type: "p",
        text: "If your team also answers comments and reports to a manager, suites such as Hootsuite, Sprout Social and Agorapulse add a shared inbox, listening and reporting around the scheduler.",
      },
      { type: "h2", text: "General chat models" },
      {
        type: "list",
        items: [
          "ChatGPT: a flexible assistant that can draft a LinkedIn post in seconds, with memory and projects to carry context. You prompt, copy, paste and post yourself.",
          "Jasper: an AI workspace for marketing teams, with brand voice and knowledge stored once and applied across content. Content is exported to your own tools.",
        ],
      },
      {
        type: "p",
        text: "A chat model is the cheapest way to try AI for LinkedIn, and for occasional posts it may be all you need. What it lacks is a routine. Nothing asks you on Monday what goes out this week. We wrote a set of prompts for it in 'ChatGPT prompts for LinkedIn posts'.",
      },
      { type: "h2", text: "A managed approval queue" },
      {
        type: "p",
        text: "The last group writes, schedules and publishes, and your part is to approve. GoodSocials is one of these. You paste your website URL, the agent writes four themes and seven posts across them, and they land on a board where each card has Approve, Revise and Reject. Approved posts publish at 09:00 in your timezone, one a day.",
      },
      {
        type: "p",
        text: "It is not for everyone, and it is better to say so here than after a trial.",
      },
      {
        type: "list",
        items: [
          "You need Instagram, TikTok or any network besides LinkedIn. We only post to LinkedIn.",
          "You post to a company page. We post to personal profiles only.",
          "Engagement is the job: comments, messages, a lead database. We do none of it.",
          "You want charts of impressions and followers. The dashboard shows posts published this month and your streak.",
          "You enjoy writing and want to keep doing it. An editor like AuthoredUp or Typefully will suit you better.",
          `Budget is the deciding factor. At ${PRO.priceLine} per profile, it costs more than most tools on this page.`,
        ],
      },
      { type: "h2", text: "How to choose in an afternoon" },
      {
        type: "steps",
        items: [
          "Count your posts over the last three months. That number is your baseline, and the only one that matters for this decision.",
          "Match the gap to a group above. No ideas or no time points to a writer or a managed queue. No polish points to an editor. Several networks points to a scheduler.",
          "Shortlist two tools from that group, no more.",
          "Run both on a real week. Use your own material, not a demo topic.",
          "At the end of the week, count what went out. Keep the tool that produced more posts you were glad to publish.",
        ],
      },
      { type: "h2", text: "Limits every LinkedIn tool shares" },
      {
        type: "p",
        text: "Some constraints come from LinkedIn and apply to every tool on this list that posts for you. LinkedIn's access for third-party apps lasts 60 days with no silent renewal, so you will be asked to reconnect about every two months. The API has no scheduling endpoint, so every scheduler stores your post and publishes it itself at the time you chose. And posting to a company page needs a separate permission LinkedIn grants only after an application, which is why some tools support pages and some do not. When you compare tools, ask each one what happens on day 61 if you have not reconnected.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials takes the writing and the routine. A revise comment on a card rewrites it and updates one of three brand principles, voice, visual or format, so the correction applies to every later post. A quality gate holds posts with invented numbers or claims with nothing behind them before they can be scheduled.",
      },
      {
        type: "p",
        text: `On the 60 day limit, we email you on day 50, show a banner on day 55, and pause scheduling cleanly if access lapses, so posts do not fail silently one by one. Pro is ${PRO.priceLine} for one profile, and Agency is ${AGENCY.priceLine} for up to ${AGENCY_SEATS}, with ${TRIAL_DAYS} days free.`,
      },
    ],
  },
  {
    slug: "taplio-alternatives",
    title: "Taplio alternatives: seven options sorted by what you need",
    description:
      "Seven Taplio alternatives grouped by need: cheaper AI writers, better editors for people who write, and tools that write and publish LinkedIn posts for you.",
    date: "2026-09-27",
    readMinutes: 5,
    related: [
      "/compare/taplio",
      "/compare/supergrow",
      "/compare/authoredup",
      "/blog/best-ai-tools-for-linkedin",
    ],
    blocks: [
      {
        type: "p",
        text: "The right Taplio alternative depends on which part of Taplio you were not using. If you want a cheaper AI writer, look at Supergrow or EasyGen; if you write your own posts and want a better editor, look at AuthoredUp or Typefully; and if you want the posts written and published without sitting at the desk, look at ContentIn or GoodSocials.",
      },
      {
        type: "p",
        text: "This page covers seven options, grouped by need, with what each does well and who should skip it. What we say about other tools comes from their public sites, as of September 2026. Features and prices change, so check theirs before you decide.",
      },
      { type: "h2", text: "What Taplio does well" },
      {
        type: "p",
        text: "Taplio is one of the best-known LinkedIn tools, and it earns that with breadth. It has an AI writer trained on a large set of LinkedIn posts, a feed of high-performing posts to borrow structure from, a scheduler with suggested times, analytics on your posts and followers, help drafting comments on other people's posts, and a database for finding leads. For someone who treats LinkedIn as a daily practice and tracks follower growth, it puts a lot of help in one place.",
      },
      {
        type: "p",
        text: "If that describes you, you may not need an alternative. When people leave, the reason is usually fit.",
      },
      { type: "h2", text: "Why people look for a Taplio alternative" },
      {
        type: "list",
        items: [
          "Taplio assumes you are at the desk. You write with AI help, pick from the library, engage in the feed. If you do not have that hour, the tool sits unused.",
          "The breadth goes unused. Many people want posts, and never open the lead database or the engagement tools.",
          "Pricing is in tiers, with the AI writing features above the entry tier. If the AI writer is what you came for, check which tier includes it.",
          "The ideas lean on patterns from other people's popular posts. Some people want posts built on their own business and their own numbers instead.",
          "The goal differs. Taplio suits people who count followers. Others would rather count how many days they posted.",
        ],
      },
      { type: "h2", text: "If you want a cheaper AI writer" },
      {
        type: "list",
        items: [
          "Supergrow: a LinkedIn writer at a price that is easy to say yes to. It learns your writing style, generates posts from a topic or your own material, builds carousels and visuals, and schedules them. A team plan adds shared spaces and client approvals. Skip it if you do not want to start every post yourself.",
          "EasyGen: writes posts in your style, informed by what top creators publish and what is trending, on a single monthly plan with a free trial. Skip it if you want posts grounded in your own business rather than in the wider feed.",
        ],
      },
      { type: "h2", text: "If you write your own posts" },
      {
        type: "list",
        items: [
          "AuthoredUp: a browser extension that improves LinkedIn's own composer with formatting, previews of where the post folds, saved hooks and endings, a library of your past posts and analytics LinkedIn does not show. Priced per user with team pricing. Skip it if you want AI to do the writing.",
          "Typefully: a calm writing and scheduling app for X, LinkedIn, Threads, Bluesky and Mastodon, with a free plan and AI help on paid tiers. Skip it if LinkedIn growth tools such as a post library are what you valued in Taplio.",
        ],
      },
      { type: "h2", text: "If you want the posts written for you" },
      {
        type: "list",
        items: [
          "ContentIn: an AI ghostwriter that learns your voice from your past posts and an interview, plans drafts for the week, publishes through LinkedIn's official API and reports on how posts did. It supports company pages. Skip it if you want to post close to daily.",
          "GoodSocials: writes posts from your website and four themes, puts them on a board where you approve, revise or reject, and publishes one a day at 09:00 in your timezone. Skip it if you want engagement tools, analytics or anything besides personal LinkedIn profiles.",
        ],
      },
      { type: "h2", text: "If LinkedIn is one network of several" },
      {
        type: "p",
        text: "Buffer is the calm choice here. It schedules to LinkedIn, Instagram, Threads, Bluesky, X and more, has a free plan, charges per connected channel, and offers an AI assistant for rewording and ideas. You write the posts. Skip it if LinkedIn is the only network that matters and you want tools built for it.",
      },
      { type: "h2", text: "What you give up when you leave Taplio" },
      {
        type: "p",
        text: "Be clear about the trade before you switch. None of the seven tools above replaces all of Taplio. The lead database and the comment drafting have no direct equivalent in most of them, and GoodSocials does neither by design. If prospecting on LinkedIn is part of your week, you may end up with two tools: one for posts and one for outreach.",
      },
      {
        type: "list",
        items: [
          "The library of high-performing posts to borrow structure from.",
          "Help drafting comments on other people's posts.",
          "The lead database.",
          "Follower and post analytics in the same place you write.",
        ],
      },
      { type: "h2", text: "How to switch without a gap in your posting" },
      {
        type: "steps",
        items: [
          "Download your LinkedIn data archive first, so you have every past post in one file whatever tool you use next.",
          "Let the posts already queued in Taplio go out before you cancel, or move them by hand.",
          "Start the new tool's trial the same week, with a real week of posts, so your cadence does not drop.",
          "Reconnect LinkedIn in the new tool. Every tool that posts for you needs its own authorisation, and each one lasts 60 days.",
          "After two weeks, compare posts published with the two weeks before the switch.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials is for the person who liked the idea of Taplio but never had the hour a day. The agent writes from your website and four themes, and a revise comment rewrites the card and updates your voice, visual or format principle, so you do not make the same correction twice. Posts can cite real figures from Stripe, GitHub, PostHog, Plausible or Notion, read only, and a quality gate holds anything that looks invented.",
      },
      {
        type: "p",
        text: `It costs ${PRO.priceLine} per profile, with writing, up to ${IMAGE_CAP_PER_MONTH} images a month and publishing included, and ${TRIAL_DAYS} days free. If you want the lead database and the engagement help, stay with Taplio.`,
      },
    ],
  },
  {
    slug: "buffer-alternatives-for-linkedin",
    title: "Buffer alternatives for LinkedIn: seven tools compared",
    description:
      "Seven Buffer alternatives for LinkedIn, from budget schedulers to LinkedIn-first editors and tools that write the posts, with who each one suits.",
    date: "2026-09-27",
    readMinutes: 4,
    related: [
      "/compare/buffer",
      "/compare/publer",
      "/compare/typefully",
      "/blog/how-to-schedule-linkedin-posts",
    ],
    blocks: [
      {
        type: "p",
        text: "If LinkedIn is the network you care about most, the best Buffer alternative is a tool that goes deeper on LinkedIn: AuthoredUp or Typefully if you write your own posts, Taplio if you want growth tools around them, and Supergrow or GoodSocials if you want the writing done. If you post to many networks on a small budget, Publer is the closest like-for-like swap.",
      },
      {
        type: "p",
        text: "Here are seven options, grouped by what you need, with who should skip each one. What we say about other tools comes from their public sites, as of September 2026. Features and prices change, so check theirs before you decide.",
      },
      { type: "h2", text: "What Buffer does well" },
      {
        type: "p",
        text: "Buffer has been scheduling social posts for over a decade. The queue is easy to read, connecting a channel takes a minute, and there is a free plan with paid plans charged per connected channel. It covers LinkedIn, Instagram, Facebook, TikTok, Threads, Bluesky, X and more, has an AI assistant for rewording and ideas, and offers drafts and approvals on the team plan. If you have a post in hand and want it out on several networks at sensible times, it is a good home for it.",
      },
      { type: "h2", text: "Why people look for a Buffer alternative for LinkedIn" },
      {
        type: "list",
        items: [
          "Buffer assumes the post exists. For most people who stall on LinkedIn, the slot was never the hard part; the writing was.",
          "It spreads across many networks, so it does not go as deep on any one. People who only care about LinkedIn want previews, formatting and ideas built for it.",
          "An edit changes that post and nothing else. The same correction comes back next week.",
          "Approvals sit on the team plan. Agencies with clients who need to sign off may want a tool built around that step.",
        ],
      },
      { type: "h2", text: "If you want a scheduler like Buffer" },
      {
        type: "list",
        items: [
          "Publer: a low-cost scheduler for a long list of networks, including Google Business, Telegram and WordPress, with bulk scheduling, recycling and an AI assistant. It has a free plan, then a base plan plus a charge per account and per member. Skip it if you want the posts written for you.",
          "Typefully: a distraction-free editor that schedules to X, LinkedIn, Threads, Bluesky and Mastodon, with a free plan and AI help on paid tiers. Skip it if you need Instagram or TikTok, which it does not cover.",
        ],
      },
      { type: "h2", text: "If you write your own posts and want LinkedIn depth" },
      {
        type: "list",
        items: [
          "AuthoredUp: a browser extension that improves LinkedIn's own composer with formatting, a preview of where the post folds, saved hooks and endings, a library of your past posts and extra analytics. Skip it if you post to other networks from the same place.",
          "Taplio: a LinkedIn growth toolkit with an AI writer trained on LinkedIn posts, a library of high-performing posts, a scheduler, analytics, comment help and a lead database. Skip it if the aim is less time on LinkedIn.",
        ],
      },
      { type: "h2", text: "If you want the posts written" },
      {
        type: "list",
        items: [
          "Supergrow: an affordable AI writer for LinkedIn that learns your style, makes carousels and visuals, and schedules. You prompt each post. Skip it if you do not want to start the posts yourself.",
          "GoodSocials: writes LinkedIn posts from your website and four themes, puts them on a board to approve, revise or reject, and publishes one a day at 09:00 in your timezone. Skip it if you need any network besides LinkedIn, or a company page.",
        ],
      },
      { type: "h2", text: "If client approvals are the hard part" },
      {
        type: "p",
        text: "Planable is built around the moment a client sees a post. Posts show as they will look in the feed, reviewers comment in place, and approval chains can be light or strict, up to team, client, legal and executive sign off. It is priced per workspace. Skip it if your team is short of writing time rather than review time.",
      },
      { type: "h2", text: "What every LinkedIn scheduler has in common" },
      {
        type: "p",
        text: "Whichever tool you pick, a few things come from LinkedIn and not from the tool. LinkedIn has no scheduling endpoint for apps, so every scheduler, Buffer included, stores your post and publishes it itself at the chosen time. Access for third-party apps lasts 60 days with no silent renewal, so every tool will ask you to reconnect about every two months.",
      },
      {
        type: "p",
        text: "The difference between tools is what happens when access runs out. Ask each one: if I forget to reconnect, do my queued posts fail silently, or does something tell me first?",
      },
      { type: "h2", text: "Keeping Buffer for the other networks" },
      {
        type: "p",
        text: "Switching away from Buffer for LinkedIn does not mean switching away from Buffer. Many people keep it for Instagram, Threads or TikTok and use a LinkedIn-first tool for the one network where written posts matter most. If you do that, remove LinkedIn from Buffer so the same post does not go out twice.",
      },
      {
        type: "steps",
        items: [
          "Let any LinkedIn posts already queued in Buffer go out, or move them by hand.",
          "Disconnect the LinkedIn channel in Buffer so its per-channel charge stops.",
          "Connect LinkedIn in the new tool and fill the first week before the old queue runs dry.",
          "Keep your other channels in Buffer as they were.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials starts one step before Buffer does. The agent writes the posts, you approve them on a board, and approved posts pass a quality gate for invented numbers and empty claims before they are scheduled. A revise comment rewrites the card and updates your voice, visual or format principle, so it applies to every later post.",
      },
      {
        type: "p",
        text: `For the 60 day limit, we email you on day 50, show a banner on day 55, and pause scheduling cleanly if access lapses. It is ${PRO.priceLine} for one profile, or ${AGENCY.price} for up to ${AGENCY_SEATS} on Agency, with ${TRIAL_DAYS} days free. It is more than Buffer costs, because the writing is included.`,
      },
    ],
  },
  {
    slug: "chatgpt-prompts-for-linkedin-posts",
    title: "ChatGPT prompts for LinkedIn posts that sound like you",
    description:
      "Ten ChatGPT prompts for LinkedIn posts, written out in full, plus how to give the model your facts and voice, and the three places it lets you down.",
    date: "2026-09-27",
    readMinutes: 6,
    related: [
      "/compare/chatgpt",
      "/blog/writing-with-ai-without-sounding-like-ai",
      "/blog/receipts-beat-opinions",
      "/blog/linkedin-post-templates",
    ],
    blocks: [
      {
        type: "p",
        text: "The ChatGPT prompts that work for LinkedIn posts all do the same thing: they hand the model a specific fact from your work and a short set of voice rules, then ask for one post with a clear shape. A prompt that only says 'write a LinkedIn post about leadership' gets a post anyone could have written.",
      },
      {
        type: "p",
        text: "Below are ten prompts you can copy, each with what it is for. After them: how to give the model your facts and voice so you stop repeating yourself, and the three places the model will let you down. Replace everything in square brackets with your own material.",
      },
      { type: "h2", text: "Set up the chat before the first prompt" },
      {
        type: "p",
        text: "ChatGPT has projects and memory, which let it carry context across chats. Put your voice rules and your reader in the project instructions once, instead of pasting them into every prompt. Keep them short: five or six plain rules and one line about who reads your posts. The first prompt below writes those rules for you.",
      },
      { type: "h2", text: "Ten ChatGPT prompts for LinkedIn posts" },
      {
        type: "list",
        items: [
          "Voice rules from your own writing. 'Here are three LinkedIn posts I wrote and liked: [paste]. Describe my voice as five short rules I can reuse: sentence length, words I use, words I avoid, how I open, how I end. Plain words, no adjectives about tone.' Use it once, then paste the rules into your project instructions.",
          "Fact first draft. 'Here are three things that happened in my work this week: [fact one], [fact two], [fact three]. Pick the one a [reader, for example a founder of a small software company] would learn most from. Write a LinkedIn post of 120 to 200 words built on it. Put the fact in the first line. Short sentences, one idea each. No hashtags, no emoji, no question at the end.' Use it when you have material and no angle.",
          "Framework post. 'Turn this lesson into a framework post: [lesson]. Give it three to five numbered steps, each one a sentence a reader could act on tomorrow. Open with the situation where the framework helps, in one line. Under 220 words.' Use it for advice you give clients often.",
          "Receipt post. 'Write a LinkedIn post reporting this result: [what changed], from [number before] to [number after], over [period], because [what was done]. Use only these numbers. If the post needs a number I have not given you, write [NUMBER NEEDED] in its place. Do not estimate.' Use it for results, and keep the bracket rule in every version.",
          "Answer a client question. 'A client asked me this week: [question]. Write a LinkedIn post that answers it in under 150 words, for a smart reader outside my field. Start with the answer, then the reason, then one example from the details below: [details].' Use it for the questions you answer on calls anyway.",
          "Better openings. 'Here is a draft post: [paste]. Write five alternative first lines. Each must name something concrete from the draft: a number, a type of client, a decision. No questions, no cliffhangers, under 20 words each.' Use it when the post is right but the start is flat.",
          "Cut by a third. 'Cut this post by a third without losing any fact, name or number: [paste]. Remove warm-up sentences and any closing line that repeats the point. Keep my wording where you can.' Use it on every draft longer than you would read yourself.",
          "Ideas from your themes. 'My LinkedIn posts cover four themes: [theme], [theme], [theme], [theme]. Give me ten post ideas spread across them, each tied to something a person in my role would see first hand. Mark the ones that need a number from me.' Use it on the day you plan the week.",
          "Ideas from an article. 'Here is an article I wrote: [paste]. Find the three ideas in it that could stand alone as LinkedIn posts. For each, give a one-line summary and the sentence from the article it rests on. Do not write the posts yet.' Use it to get a week of posts out of one piece.",
          "Editor pass. 'Read this draft as a strict editor: [paste]. List every sentence that could appear in anyone's post, every number with no source, and every word I would not say out loud to a client. List the problems only, no rewrite.' Use it last, before anything goes out.",
        ],
      },
      { type: "h2", text: "How to give ChatGPT your facts" },
      {
        type: "p",
        text: "Specific input produces specific posts far more reliably than any instruction about style. The model cannot know what happened in your week, so tell it.",
      },
      {
        type: "steps",
        items: [
          "Keep a running note during the week: questions clients asked, numbers you saw change, decisions you made and why.",
          "Write each fact as one sentence with the detail in it. 'A client cut onboarding from nine steps to four' beats 'we improved onboarding'.",
          "Give the source with every number: the dashboard, the invoice, the report.",
          "Paste the facts at the top of the prompt, before the instruction.",
          "Tell the model to use only those facts, and to leave a bracket where a fact is missing.",
        ],
      },
      { type: "h2", text: "How to give it your voice" },
      {
        type: "p",
        text: "Voice rules work best as a short list of plain instructions with an example or two. 'Short sentences, one idea each. Name the client type. No exclamation marks. End on the practical point. No closing question.' Each time you fix the same thing in a draft twice, add a rule for it, so the list grows from your own corrections.",
      },
      { type: "h2", text: "Where ChatGPT lets you down" },
      {
        type: "p",
        text: "ChatGPT is a capable writer. The problems below are about what happens around the writing, and they are the reasons most people who post with it stop after a few weeks.",
      },
      {
        type: "list",
        items: [
          "It forgets corrections between chats. Memory decides for itself what to keep, and a fix you made in Tuesday's chat may not reach Thursday's. Put lasting rules in the project instructions, and check them there, not in your head.",
          "It invents numbers. Ask for a result without supplying one and you may get a plausible figure nobody measured. The bracket rule in the receipt prompt is the defence, and it only works if you keep it in every prompt.",
          "It writes 'I' claims you never made. 'I spent years learning this the hard way' reads well and is a sentence you did not write about a thing that may not have happened. Read every first person line and delete any that did not come from your notes.",
          "It has no routine. Nothing reminds you on Monday, and the copy, the paste, the image and the timing are all still yours.",
        ],
      },
      { type: "h2", text: "A last check before you post" },
      {
        type: "list",
        items: [
          "Every number has a source you could name if someone asked.",
          "The first line says something specific.",
          "No sentence claims a feeling or an experience you did not have.",
          "It stays well inside LinkedIn's 3,000 character limit and reads cleanly on a phone.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials works like these prompts with the gaps closed. A revise comment rewrites the card and updates one of three brand principles, voice, visual or format, which you can read in settings, so a correction stays made. When a post needs a number only you know, the card names it and the draft leaves a bracket, and a quality gate holds any post with an invented number before it can be scheduled.",
      },
      {
        type: "p",
        text: "Posts are written in the third person by rule, naming the company and the source, so nothing claims an experience you did not have. Approved posts publish at 09:00 in your timezone, one a day.",
      },
    ],
  },
  {
    slug: "download-your-linkedin-posts",
    title: "How to download and export your LinkedIn posts",
    description:
      "To download your LinkedIn posts, request a copy of your data under Settings, Data privacy. Posts arrive in Shares.csv with a date, a link and the text.",
    date: "2026-09-27",
    readMinutes: 4,
    related: [
      "/blog/content-themes-for-linkedin",
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/repurpose-blog-post-into-linkedin-posts",
      "/blog/linkedin-content-calendar",
    ],
    blocks: [
      {
        type: "p",
        text: "To download your LinkedIn posts, open Settings, go to Data privacy, choose Get a copy of your data, and request your archive. LinkedIn emails you when it is ready, and your posts are in a file called Shares.csv inside it, one row per post with a date, a link and the text.",
      },
      {
        type: "p",
        text: "That is the whole route. There is no button that exports posts on their own, and no app can fetch them for you, for reasons covered below. The rest of this page walks through each step, what is in the file, and what to do with it once you have it.",
      },
      { type: "h2", text: "Step by step" },
      {
        type: "steps",
        items: [
          "Sign in to LinkedIn on the web and open the Me menu under your photo.",
          "Choose Settings and privacy, then Data privacy in the side menu.",
          "Choose Get a copy of your data.",
          "Pick either the larger archive of everything, or tick the specific files you want if your posts are listed as an option.",
          "Choose Request archive and confirm with your password.",
          "Wait for the email from LinkedIn saying your archive is ready, then come back to the same page to download it.",
          "Unzip the file and look for Shares.csv.",
        ],
      },
      {
        type: "p",
        text: "LinkedIn changes the labels on these screens from time to time. If a name above does not match, search your settings for 'copy of your data'.",
      },
      { type: "h2", text: "The full archive or only some files" },
      {
        type: "p",
        text: "LinkedIn offers two choices: a larger archive with everything it holds about your account, or a smaller set of files you pick. If you only want your posts and they appear in the list, the smaller request is enough. If you are unsure which file holds what, request the full archive. It is more to unzip, but you will not need to ask twice.",
      },
      { type: "h2", text: "How long it takes" },
      {
        type: "p",
        text: "LinkedIn says preparing the archive can take some time, and the larger archive usually takes longer than a few chosen files. You do not need to keep the page open. Request it, carry on with your day, and download it when the email arrives.",
      },
      { type: "h2", text: "What is inside Shares.csv" },
      {
        type: "p",
        text: "Shares.csv is a spreadsheet with one row per post you published. The three columns that matter are a date, a link and the text: the date you posted, the permalink to the post on LinkedIn (in a column called ShareLink) and what you wrote (in a column called ShareCommentary). There are a few other columns about attached links, media and visibility.",
      },
      {
        type: "list",
        items: [
          "Dates carry no time zone label. They are in UTC, so a post from late evening may show under the next day.",
          "Reshares where you added no words appear as rows with an empty text cell.",
          "Post text contains commas, quotes and line breaks. Open the file with your spreadsheet's import tool instead of pasting it, or rows will split in the wrong places.",
        ],
      },
      { type: "h2", text: "Why there is no API for this" },
      {
        type: "p",
        text: "Reading a member's own posts through LinkedIn's API needs a permission LinkedIn has closed to new applications. There is no route to your post history for a new app, at any price. Any tool that works from your past posts has to get them some other way, and the archive you download yourself is the one route LinkedIn offers for every post you have written.",
      },
      { type: "h2", text: "What to do with your posts" },
      {
        type: "p",
        text: "Once you have the file, it is the best research material you own. It is your writing, in your voice, with the dates attached.",
      },
      {
        type: "list",
        items: [
          "Check your real cadence. Count the posts per month for the last year. Most people find the gaps are longer than they remembered.",
          "Audit your themes. Tag each post with what it was about. If one topic takes most of the rows, or a topic you want to be known for is missing, you know what to write next.",
          "Find your best openings. Read only the first line of every post. Copy the ones that made you want to read on into a list you keep beside you when you write.",
          "Reuse what still holds. An idea from two years ago may be worth writing again with what you know now. Update the numbers and the examples; do not repost the old text word for word.",
          "Collect your own rules. Notice the words and habits you like in your best posts and write them down as voice rules for the next ones.",
        ],
      },
      { type: "h2", text: "A one-hour audit" },
      {
        type: "steps",
        items: [
          "Open Shares.csv with your spreadsheet's import tool and sort by date, newest first.",
          "Delete the rows with empty text.",
          "Add a column for theme and fill it for the last 50 posts.",
          "Add a column for the kind of post: an opinion, a framework, a result with a number, or a finding.",
          "Count each column. Write two sentences on what you want more of and less of next quarter.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials imports Shares.csv from Settings. Your browser reads the file before anything is sent, skips reshares with no text, and keeps the most recent 300 posts. Re-importing a newer archive six months later adds only the posts since, because each post is matched by its permalink.",
      },
      {
        type: "p",
        text: "Your past posts then appear on the calendar as background, beside the new posts on your board, so you can see what you wrote last spring while you approve next week. They are reference only: never republished and never touched by the publishing schedule.",
      },
    ],
  },
];
