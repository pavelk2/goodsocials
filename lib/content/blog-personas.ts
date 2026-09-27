import type { BlogPost } from "./types";
import { AGENCY_SEATS } from "@/lib/legal";
import { PLANS } from "@/lib/plans";

const AGENCY = PLANS.find((plan) => plan.slug === "agency")!;

/** Who is posting: founders, consultants, B2B SaaS teams, profile or page, and the voice guide behind it. */
export const PERSONA_POSTS: BlogPost[] = [
  {
    slug: "linkedin-for-founders",
    title: "LinkedIn for founders: what to post and how long it takes",
    description:
      "A founder LinkedIn strategy in one page: post decisions, hiring and customer lessons with numbers you own, in about 90 minutes a week.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "A good founder LinkedIn strategy is to post what only you can see from inside the company: the decisions you made, the numbers behind them, the people you are hiring and what customers taught you. Do it on a steady rhythm, two to five times a week, in one writing session of about 90 minutes, and let the posts do quiet work for fundraising, hiring and sales without ever turning into a pitch.",
      },
      {
        type: "p",
        text: "That is the short version. The rest of this post covers what to write, what to leave out, and how to keep it going in the months when the company needs all of you.",
      },
      { type: "h2", text: "What founders should post on LinkedIn" },
      {
        type: "p",
        text: "Your advantage over every other voice in the feed is access. You know why the pricing changed, why the second hire was a salesperson and not an engineer, and what the customer said on the call before they signed. Most of that is more interesting to your audience than you expect, because they never get to see it.",
      },
      {
        type: "list",
        items: [
          "Decisions. What you chose, what you gave up, and what you would need to see to change your mind. 'Dropped the free plan in May. Here is what the numbers looked like before and after.'",
          "Numbers you own. Revenue, churn, activation, time to first value, whatever you can share. Small numbers from a real company beat big numbers from a report.",
          "Hiring. The role you are filling, what the job looks like on a Tuesday, and what you learned from the last hire.",
          "Customers. A problem a customer brought, how you worked it out, and what changed for them. With their permission, or without their name.",
          "Mistakes with a cost attached. A launch that missed, a feature nobody used, a channel that burned money. Say what it cost and what you do differently now.",
        ],
      },
      { type: "h2", text: "Building in public with numbers you own" },
      {
        type: "p",
        text: "Building in public works when the numbers are yours and the context is honest. A post that says monthly revenue went from 8,000 to 11,000 over a quarter, and names the two changes behind it, gives a reader something to learn from. A post that says 'huge month, grateful for the team' gives them nothing.",
      },
      {
        type: "p",
        text: "You do not have to share everything. Pick a line and hold it. Some founders share growth rates but not totals. Some share totals but not margins. Some share a single metric every month, the same one, so readers can follow the story. Consistency matters more than disclosure: a number that appears in good months and vanishes in bad ones tells readers what they need to know.",
      },
      {
        type: "list",
        items: [
          "Share the direction and the method when the value is sensitive.",
          "Round only when you say you rounded. 'About 40 customers' is honest.",
          "Never post a number you would not want an investor to check.",
          "Keep a note of what you have shared, so next quarter's post uses the same definition.",
        ],
      },
      { type: "h2", text: "What founders should avoid posting" },
      {
        type: "list",
        items: [
          "Announcements with nothing inside them. 'Excited to share' followed by a feature name is a press release, and readers treat it like one.",
          "Hustle and hours. Posts about how late you worked say little about the company and age badly.",
          "Vague lessons. 'Culture eats strategy' has been posted many thousands of times. Your specific version of it, with the situation attached, has not.",
          "Anything a customer, employee or investor would be surprised to read about themselves.",
          "Posts written to go viral. The people you need to reach are a few hundred buyers, candidates and investors, and they respond to substance.",
        ],
      },
      { type: "h2", text: "How much time LinkedIn takes a founder" },
      {
        type: "p",
        text: "Less than most founders fear, if the writing is batched. Writing one post a day, every day, fails for almost everyone with a company to run. Writing a week of posts in one sitting and letting a schedule release them is sustainable for years.",
      },
      {
        type: "steps",
        items: [
          "Keep a running note during the week. Every decision, number, customer question and argument goes in it, one line each.",
          "Block 90 minutes once a week, at the same time. Many founders pick Friday afternoon.",
          "Choose the best three to five items and draft them in that session, one idea per post.",
          "Reread the drafts the next morning, cut anything vague, and check every number.",
          "Schedule them at a fixed time each day so posting stops being a decision.",
          "Spend ten minutes after each post goes out answering comments. That part should stay yours.",
        ],
      },
      { type: "h2", text: "How posts help fundraising without being a pitch" },
      {
        type: "p",
        text: "Investors read founder profiles before a first meeting, and a year of posts about decisions and numbers shows how you think better than a deck can. When you raise, the people you contact may already know what you are building and how it has been going. The posts do this work only if they were never asks. A founder who posts 'we are raising, DM me' has spent the credibility the other posts built.",
      },
      { type: "h2", text: "How posts help hiring" },
      {
        type: "p",
        text: "Candidates look at the founder before they apply, and they are trying to answer one question: would working here be good? Posts about how decisions get made, what the team shipped and how you handled a hard week answer it more convincingly than a careers page. When you do post a role, describe the work in plain terms and say who would hate the job as well as who would love it. The right people self-select.",
      },
      { type: "h2", text: "How posts help sales" },
      {
        type: "p",
        text: "Buyers want to know you understand their problem before they want to hear about your product. A post that walks through how a customer's problem was diagnosed, what it cost them and what changed, shows that understanding to every reader with the same problem. You never need to add a link or a call to action. The people who recognise themselves will find the website on their own, and the sales call starts further along.",
      },
      { type: "h2", text: "Your profile or the company page" },
      {
        type: "p",
        text: "Post from your own profile first. Readers follow people more readily than logos, and a founder's name carries the story in a way a page cannot. The company page still has uses, covered in the guide to personal profiles and company pages, but the founder's feed is where most of the reading happens.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes posts for your personal profile from your website, four themes and three brand principles, and you approve them on a board. It can read your own numbers, read-only, from Stripe, GitHub, PostHog, Plausible and Notion, and when a post needs a figure only you have, the card asks for it instead of inventing one. Posts are written in the third person, naming the company and the source, and they publish at 09:00 in your timezone so the rhythm holds in the weeks you are busiest.",
      },
    ],
    related: [
      "/blog/receipts-beat-opinions",
      "/blog/how-often-to-post-on-linkedin",
      "/blog/personal-profile-vs-company-page",
      "/blog/linkedin-for-b2b-saas",
    ],
  },
  {
    slug: "linkedin-for-consultants",
    title: "LinkedIn for consultants: how to post to win clients",
    description:
      "Consultants win clients on LinkedIn by showing their method, sharing client results with permission and answering the questions buyers ask before a call.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "LinkedIn works for consultants when your posts show a buyer how you think before they ever book a call. Show your method, share client results with permission and without names where needed, and answer the questions buyers ask before they hire someone like you. Post two to five times a week on a steady rhythm, and the right clients arrive already half convinced.",
      },
      {
        type: "p",
        text: "Most consultants who try LinkedIn post about their services or share general advice. Neither gives a buyer much reason to pick them. What follows is how to write the posts that do.",
      },
      { type: "h2", text: "Why LinkedIn suits consulting" },
      {
        type: "p",
        text: "A consultant sells judgement, and judgement is hard to show on a website. A services page says what you do. A year of posts shows how you do it: what you look at first, what you ignore, where you disagree with the usual advice. By the time a buyer reaches out, they have watched you work through a dozen problems like theirs, and the first call is about fit and timing instead of trust.",
      },
      { type: "h2", text: "Show the method" },
      {
        type: "p",
        text: "Many consultants worry that explaining their method gives it away. In practice the opposite happens. Buyers do not hire you because they cannot find the steps. They hire you because they do not have the time, the distance or the experience to apply them well. Showing the method proves you have one.",
      },
      {
        type: "list",
        items: [
          "The first three questions you ask on every engagement, and why those three.",
          "A diagnostic you run: what you measure, what a healthy result looks like, what a worrying one looks like.",
          "A decision rule. 'When a client has fewer than 20 customers, pricing work comes before positioning work, and here is why.'",
          "A before and after of a document, a page or a process, with the reasoning for each change.",
          "The mistake you see most often, and the check that catches it.",
        ],
      },
      { type: "h2", text: "Client results, anonymised and with permission" },
      {
        type: "p",
        text: "A result from real client work is the strongest post a consultant can write, and the one most likely to go wrong. The rule is simple: never share anything a client would be surprised to read. Ask first, even when you plan to leave out the name.",
      },
      {
        type: "steps",
        items: [
          "Pick a result with a clear before and after: a number, a time, a cost, a decision.",
          "Write the post first, with the client's details removed, so they can see exactly what would appear.",
          "Send it to the client and ask whether they are happy for it to go out, named or unnamed.",
          "Remove anything that would identify them if they prefer, including industry details that narrow it to one company.",
          "Keep the permission in writing, in the same folder as the engagement.",
        ],
      },
      {
        type: "p",
        text: "When a figure is confidential, share the direction and the method instead. 'Support tickets in the first month fell by about half after onboarding went from nine steps to four' is useful even without the client's name or the raw count.",
      },
      { type: "h2", text: "Answer the questions buyers ask before a call" },
      {
        type: "p",
        text: "Every consultant hears the same questions in discovery calls. Each one is a post, and writing it publicly means the next buyer arrives with it already answered.",
      },
      {
        type: "list",
        items: [
          "How long does an engagement like this usually take?",
          "What do you need from our team, and how much of their time?",
          "What happens if it does not work?",
          "How is this different from hiring someone full time?",
          "What should we have in place before we start?",
          "How do you charge, and why that way?",
        ],
      },
      {
        type: "p",
        text: "Keep a list during the month. Any question you answer twice on calls goes on it. A consultant with a steady flow of calls will never run out of material this way.",
      },
      { type: "h2", text: "How often should a consultant post on LinkedIn" },
      {
        type: "p",
        text: "Pick a cadence you can hold in your busiest month, when client work leaves no slack. For most independent consultants that is two or three posts a week. Posting daily is possible if the writing happens in one weekly batch and something else takes care of the publishing. What matters to a buyer is that your recent activity is recent. A profile whose last post is from spring says you are either very busy or no longer doing this work, and the buyer cannot tell which.",
      },
      { type: "h2", text: "What consultants should avoid" },
      {
        type: "list",
        items: [
          "Service announcements. 'Now taking on two new clients' works once a year at most.",
          "Advice with no situation behind it. It reads like every other consultant in your field.",
          "Client complaints, even anonymous ones. Future clients read them and wonder what you will say about them.",
          "Borrowed statistics you cannot source. One made-up number undoes the credibility of the rest.",
          "Posts that end in a pitch. The reader who needs you knows how to find your profile.",
        ],
      },
      { type: "h2", text: "From post to conversation" },
      {
        type: "p",
        text: "The path from a post to a client is usually slow and indirect. Someone reads a few posts over a few months, looks at your profile, and gets in touch when the problem becomes urgent. Make that last step easy. Your headline should say who you help and with what. Your About section should say how an engagement starts. Reply to every comment from someone who could be a buyer, because a comment is often the first move. After that, let the posts keep doing the patient part.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "Each GoodSocials board has a goal, and leads is one of them. A leads board favours ideas that show the work: a problem a client brought, how it was diagnosed, what it cost before and after, never a pitch and never a discount. When a post needs a client figure only you have, the card names it and the draft leaves a bracketed gap until you supply it in a revise comment, and a quality check holds any draft with an invented number before it can be scheduled.",
      },
    ],
    related: [
      "/blog/receipts-beat-opinions",
      "/blog/how-often-to-post-on-linkedin",
      "/blog/linkedin-for-founders",
      "/blog/brand-voice-for-linkedin",
    ],
  },
  {
    slug: "linkedin-for-b2b-saas",
    title: "LinkedIn strategy for B2B SaaS: people before the page",
    description:
      "A LinkedIn strategy for B2B SaaS that runs through the founder's and team's profiles, built on lessons from product data instead of feature announcements.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "The LinkedIn strategy that works for most B2B SaaS companies puts the founder and a few team members at the centre and the company page at the edge. Those people post lessons drawn from the product and its data, not a stream of feature announcements, on a steady weekly rhythm and under a small set of themes. The company page carries announcements, jobs and ads, and borrows from the people.",
      },
      { type: "h2", text: "Why personal profiles carry more than the company page" },
      {
        type: "p",
        text: "It is widely observed that posts from people reach and engage more readers than posts from company pages, and most B2B marketers who have tried both will tell you the same. LinkedIn does not publish how its feed ranks posts, so treat the reasons as reasonable guesses. People follow people. A person's post reaches their connections, who know them. A comment on a person's post starts a conversation with someone, while a comment on a page's post is addressed to a logo.",
      },
      {
        type: "p",
        text: "For a B2B software company this matters because your buyers are people with jobs, and they trust peers. A head of finance is more likely to read a post from another operator about closing the books faster than an announcement from a software brand about a new export button.",
      },
      { type: "h2", text: "Who on the team should post" },
      {
        type: "list",
        items: [
          "The founder or CEO. Decisions, strategy, the numbers behind the business, the market as seen from inside it.",
          "The product lead. Why something was built, what users did with it, what got cut and why.",
          "An engineer who likes writing. How a hard problem was solved, what broke, what the fix cost.",
          "Someone in sales or customer success. The questions customers ask, the problems they arrive with, what they wish they had known.",
        ],
      },
      {
        type: "p",
        text: "Two or three people posting regularly is plenty. Forcing the whole team to post produces thin posts, and readers notice when a company has handed out a content quota.",
      },
      { type: "h2", text: "Product updates vs lessons" },
      {
        type: "p",
        text: "The default for SaaS teams is to post the changelog. A feature ships, a post goes up saying so. These posts matter to current customers and to nobody else, and current customers already get the release email.",
      },
      {
        type: "p",
        text: "Every product update has a lesson inside it. The feature exists because someone noticed a problem, made a decision and measured something. Post that instead, and mention the feature where it fits.",
      },
      {
        type: "list",
        items: [
          "Update: 'New: bulk export to CSV.' Lesson: 'Support tickets about exporting data were the second largest category last quarter. Most came from finance teams closing the month. Here is what they were trying to do.'",
          "Update: 'Onboarding redesign is live.' Lesson: 'Activation sat flat for six months. Three changes to the first screen moved it. One of them was deleting a step.'",
          "Update: 'Faster dashboards.' Lesson: 'The slowest query was one nobody had looked at in two years. What an afternoon of profiling turned up.'",
        ],
      },
      { type: "h2", text: "Using your product data" },
      {
        type: "p",
        text: "A SaaS company sits on more publishable numbers than almost any other kind of business. Billing, product analytics, web analytics and the code history all record what happened, with dates. That is the raw material for receipt posts, the kind nobody else can write.",
      },
      {
        type: "list",
        items: [
          "Billing: new revenue, new customers and churn in the last 30 days, and how they moved after a pricing or packaging change.",
          "Product analytics: which feature got used after launch, where people drop out of onboarding.",
          "Web analytics: which pages bring visitors and from where, including the visits your own posts send.",
          "Code history: what shipped this month, counted from merged pull requests and releases.",
          "Internal notes: the decision documents and retros where the reasoning is already written down.",
        ],
      },
      {
        type: "p",
        text: "Decide once what you are willing to share, and write it down. Many companies share growth rates and customer counts but not revenue totals. Whatever the line is, keep the definitions the same from post to post, so a reader following along can trust the comparison.",
      },
      { type: "h2", text: "Pick four themes" },
      {
        type: "p",
        text: "Themes decide what posts are allowed to be about, and they keep a team from repeating the same three ideas. Four is enough to cover a SaaS company without losing focus. An example for a small billing tool:",
      },
      {
        type: "list",
        items: [
          "How finance teams close the month, and where the time goes.",
          "Pricing and packaging decisions, with the numbers that followed.",
          "Building the product: what was built, what was cut, what broke.",
          "Running a small software company: hiring, tooling, trade-offs.",
        ],
      },
      {
        type: "p",
        text: "Each person can lean toward the themes closest to their job. The founder takes pricing and the business, the product lead takes building, and customer success takes the month-end problems customers bring.",
      },
      { type: "h2", text: "Cadence across a team" },
      {
        type: "p",
        text: "One post a day from the company as a whole, spread across two or three people, is a strong rhythm for a small SaaS team. That works out to two or three posts a week each, which fits beside a full job if the drafts are written in a weekly batch. Measure the rhythm itself, posts published and weeks without a gap, before you look at anything else. Reach follows consistency far more reliably than it follows any single post.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials posts to personal profiles, one board per person, and it can read a company's own numbers read-only from Stripe, GitHub, PostHog, Plausible and Notion with a pasted key. Sources sync once a day and a reading that stops coming back is removed, so no draft cites last quarter's churn as current. Posts are written in the third person, naming the company and the source, so a line like 'Stripe shows 42 new customers in August' says whose number it is.",
      },
      {
        type: "p",
        text: `The Agency plan holds up to ${AGENCY_SEATS} profiles for ${AGENCY.priceLine}, so a founder, a product lead and a few colleagues can each have their own board, themes and principles. Each person connects their own LinkedIn account, and nobody shares a password.`,
      },
    ],
    related: [
      "/blog/personal-profile-vs-company-page",
      "/blog/receipts-beat-opinions",
      "/blog/content-themes-for-linkedin",
      "/blog/linkedin-for-founders",
    ],
  },
  {
    slug: "personal-profile-vs-company-page",
    title: "LinkedIn personal profile vs company page: where to post",
    description:
      "Personal profiles tend to reach more people than company pages, but a page still matters for ads, careers and credibility. How to run both well.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "For most small companies, posting from a personal profile reaches more people than posting from a company page, and it is the better place to spend your writing time. A company page still matters for ads, for jobs and as a place buyers and candidates check that the business is real. The practical answer is to write for the people first and let the page carry a lighter, different load.",
      },
      { type: "h2", text: "The difference at a glance" },
      {
        type: "list",
        items: [
          "A personal profile belongs to one person. Posts reach their connections and followers, and comments are a conversation with someone.",
          "A company page belongs to the business and can have several admins. Posts reach page followers, and the page is where LinkedIn ads, job posts and company details live.",
          "A person can connect, message and comment as themselves. A page's reach in the feed is mostly limited to the people who chose to follow it.",
          "A profile goes with the person if they leave. A page stays with the company.",
        ],
      },
      { type: "h2", text: "Why people reach further than pages" },
      {
        type: "p",
        text: "It is widely observed, by marketers and by anyone who has posted the same thing from both, that personal posts tend to travel further than page posts. LinkedIn does not publish how its feed ranks posts, so nobody outside the company can give you the rule. The likely reasons are ordinary ones. People follow people they know or want to learn from. A post from a person shows up for connections who met them, worked with them or heard them speak. A reply to a person feels like talking to someone. A reply to a page feels like writing to a support inbox.",
      },
      {
        type: "p",
        text: "There is a trust side too. A founder describing a hard decision reads as honest. The same words from a logo read as marketing, because readers know a company page is managed.",
      },
      { type: "h2", text: "When a company page still matters" },
      {
        type: "list",
        items: [
          "Ads. LinkedIn's sponsored posts run from a company page, so if you plan to advertise, the page needs to exist and look looked after.",
          "Hiring. Job posts are tied to the company, and candidates click through to the page to see who works there and what the company says about itself.",
          "Credibility. Buyers and investors check the page before a call. An empty page with a logo from three years ago raises a question you do not want asked.",
          "Staff profiles. Employees who list the company link to the page, which gives it a steady trickle of visitors.",
          "Continuity. When someone leaves, their followers leave with them. The page is the account the company keeps.",
        ],
      },
      { type: "h2", text: "How to run both without doubling the work" },
      {
        type: "p",
        text: "The mistake is writing two full streams of content. Put the writing effort into people's profiles, and give the page a smaller, specific job.",
      },
      {
        type: "steps",
        items: [
          "Decide who posts from their own profile. Usually the founder and one or two others.",
          "Give those people a steady cadence, two to five posts a week each, written in a weekly batch.",
          "Give the page one to three posts a week: releases, hires, events, customer stories with permission, and occasional reshares of the team's best posts.",
          "Keep the page's About section, logo, banner and website link up to date. That is most of what a visiting buyer looks at.",
          "If you run ads, write them for the page separately. Ad copy and organic posts do different jobs.",
        ],
      },
      { type: "h2", text: "What to post where" },
      {
        type: "list",
        items: [
          "Personal profile: decisions, lessons, numbers from the business, customer problems and how they were solved, opinions with evidence behind them.",
          "Company page: product releases, job openings, events, company milestones, case studies approved by the customer.",
          "Both, with different angles: a launch. The page announces it. The founder posts why it was built and what the team learned on the way.",
        ],
      },
      { type: "h2", text: "Should employees post about the company" },
      {
        type: "p",
        text: "Yes, when they want to and when they have something to say. An engineer describing how a hard bug was found, or a support lead describing the question customers ask most, gives readers a view of the company no page post can. Do not hand out scripts or ask everyone to post the same announcement on the same morning. Readers notice identical posts, and the people posting feel it too. Offer the facts and the permission, and let each person write in their own words.",
      },
      { type: "h2", text: "Who should post from a personal profile" },
      {
        type: "p",
        text: "Anyone whose name a buyer, candidate or investor would recognise: founders, partners, heads of product, independent consultants. For a one-person business the question hardly comes up, because the person is the brand and the page is mostly a directory entry. For a larger company, the personal profiles of a few senior people usually do more than the page, and the page does better when it points at them.",
      },
      { type: "h2", text: "A note on tools" },
      {
        type: "p",
        text: "Scheduling tools differ on this. Some post to both profiles and pages, some to pages only, some to profiles only. If a page matters to you, check which a tool supports before you pay. Whichever you pick, a tool that posts on your behalf through LinkedIn's API has to ask you to reconnect about every 60 days, because LinkedIn gives third-party apps access that lasts 60 days with no way to renew it in the background.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials posts to personal profiles only. Posting to a company page needs a LinkedIn permission that sits behind its Community Management API, and LinkedIn gates access to it, so we built around the profiles where founders and consultants are read. If you need page posts too, run the page by hand or with another tool, and let GoodSocials keep the personal cadence going. We email you on day 50 of each LinkedIn connection and show a banner on day 55, so the reconnection never catches you out.",
      },
    ],
    related: [
      "/blog/linkedin-for-b2b-saas",
      "/blog/linkedin-for-founders",
      "/compare/hootsuite",
      "/blog/how-to-schedule-linkedin-posts",
    ],
  },
  {
    slug: "brand-voice-for-linkedin",
    title: "Brand voice for LinkedIn: a guide that fits on one screen",
    description:
      "A LinkedIn tone of voice guide should fit on one screen: three short principles for voice, visual and format, written as rules a writer can follow.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "A useful brand voice guide for LinkedIn fits on one screen. Write three short principles, one for voice, one for visual and one for format, each two or three sentences long and each made of rules a writer can check a draft against. Then update them every time you catch yourself making the same edit twice.",
      },
      {
        type: "p",
        text: "Most voice guides fail the other way. They run to twenty pages, describe the brand's personality in adjectives, and sit in a shared drive where nobody opens them after the first week.",
      },
      { type: "h2", text: "Why most brand voice guides go unused" },
      {
        type: "list",
        items: [
          "They describe instead of instruct. 'Friendly, confident, human' tells a writer how the brand wants to feel, not what to do with the next sentence.",
          "They are too long. A writer with a draft open will not read twenty pages to check one line.",
          "They never change. The guide was written once at a workshop, and the edits you make every week never make it back into it.",
          "They try to cover every channel. A LinkedIn post, a support email and a billboard need different rules.",
        ],
      },
      { type: "h2", text: "The three principles: voice, visual, format" },
      {
        type: "p",
        text: "Three is enough. More than that and rules start to argue with each other, and the writing turns grey trying to satisfy all of them.",
      },
      {
        type: "list",
        items: [
          "Voice: how the posts sound. Register, sentence length, what evidence they cite, what they will never claim.",
          "Visual: what an image for a post looks like. Subject matter, treatment, and what to avoid.",
          "Format: how a post is built. Typical length, how it opens, whether it uses line breaks or lists, how it ends.",
        ],
      },
      { type: "h2", text: "Good rules and useless rules" },
      {
        type: "p",
        text: "A good rule is one you could hand to a stranger with a draft and they could tell whether the draft follows it. A useless rule is one every draft technically passes.",
      },
      {
        type: "list",
        items: [
          "Useless: 'Be authentic.' Useful: 'Numbers before adjectives. If a sentence says growth was strong, replace it with the growth.'",
          "Useless: 'Sound confident.' Useful: 'No hedging words such as might, perhaps or arguably when the evidence is in the post.'",
          "Useless: 'Keep it engaging.' Useful: 'Open with the most specific fact in the post. Never open with a question.'",
          "Useless: 'Professional yet approachable.' Useful: 'Short sentences. One idea per paragraph. No industry jargon a customer would not use.'",
          "Useless: 'Eye-catching visuals.' Useful: 'Photographs of real work spaces, muted colour, no stock people shaking hands, no text in the image.'",
          "Useless: 'Concise.' Useful: 'Under 1,300 characters. End on the finding, not a call to action.'",
        ],
      },
      { type: "h2", text: "How to write your first version" },
      {
        type: "steps",
        items: [
          "Collect ten posts you admire, from anyone, and ten of your own you are unhappy with.",
          "For each one, write down in a line what makes it work or fail. Be concrete: 'buries the number', 'three adjectives in the first line'.",
          "Group the lines into voice, visual and format.",
          "Turn each group into two or three sentences written as instructions. 'Say where the number came from' instead of 'we value transparency'.",
          "Read your last five posts against the guide. If none of them would change, the rules are too vague.",
        ],
      },
      { type: "h2", text: "An example that fits on one screen" },
      {
        type: "p",
        text: "Here is what a finished guide might look like for a small bookkeeping firm that posts on LinkedIn:",
      },
      {
        type: "list",
        items: [
          "Voice: Plain, short declarative sentences with no hedging. Every claim names where it came from, usually client work described without names. Never promises savings or outcomes a reader could not check.",
          "Visual: Photographs of desks, paperwork and small offices, natural light, muted colour. No stock people, no charts with invented numbers, no text in the image.",
          "Format: 800 to 1,300 characters. First line is the most specific fact in the post. Short paragraphs, a list only when there are three or more parallel items, and the post ends on the finding.",
        ],
      },
      { type: "h2", text: "Update it from the edits you keep making" },
      {
        type: "p",
        text: "The best source of new rules is your own red pen. Every time you edit a draft, you are telling the guide something it did not know. Most people make the same edit dozens of times and never write it down.",
      },
      {
        type: "steps",
        items: [
          "When you change a draft, note the change in one line.",
          "The second time you make the same kind of change, it is a pattern.",
          "Rewrite the matching principle so the rule is built in. Replace the old sentence rather than adding a new one at the bottom, so the principle stays short.",
          "Separate facts from rules. 'The figure is 40 not 60' is a correction to one post. 'Always say whether a figure is monthly or annual' is a rule.",
          "Reread the whole guide once a quarter and delete anything no draft has broken in months.",
        ],
      },
      { type: "h2", text: "What does not belong in a voice guide" },
      {
        type: "list",
        items: [
          "Your mission statement. It describes the company, not the writing.",
          "Topics. What you post about belongs in your themes, a separate short list.",
          "Rules for other channels. Keep a LinkedIn guide about LinkedIn.",
          "Tricks for reach. A rule like 'always ask a question at the end' is a tactic, and it ages faster than a voice.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "Every GoodSocials profile has exactly three brand principles, voice, visual and format, written from your website at setup as instructions to a writer, two or three sentences each. They are plain text on the board, and you can edit them whenever you like.",
      },
      {
        type: "p",
        text: "The part that saves the most time is the revise comment. When you write a comment on a card, it rewrites that card and decides which one principle the comment was about. If the comment is a standing preference, such as 'no questions as openers', the matching principle is rewritten in full with the rule folded in, not appended as a note, and the board tells you in one sentence what every future post will now do. If the comment corrects a fact about that one card, such as a wrong number or a client who should not be named, the card is fixed and no principle changes, so a one-off correction never turns into a rule.",
      },
      {
        type: "p",
        text: "Two things stay fixed whatever a principle or a comment says. Posts are written in the third person, naming the company and the source, because software wrote them. And a request for engagement bait or a claim bigger than the evidence gets the smallest honest version on the card and is never written into a principle.",
      },
    ],
    related: [
      "/blog/writing-with-ai-without-sounding-like-ai",
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/content-themes-for-linkedin",
      "/blog/linkedin-for-consultants",
    ],
  },
];
