import type { BlogPost } from "./types";
import { AGENCY_SEATS } from "@/lib/legal";
import { PLANS } from "@/lib/plans";

const AGENCY = PLANS.find((plan) => plan.slug === "agency")!;

/** Searches from freelancers and small agencies who write LinkedIn posts for clients: starting, pricing, running accounts, approvals, AI. */
export const AGENCY_POSTS: BlogPost[] = [
  {
    slug: "start-a-linkedin-ghostwriting-business",
    title: "How to start a LinkedIn ghostwriting business",
    description:
      "Pick a narrow niche, run a proper intake call, capture each client's voice, and sign a contract that settles approval, account access and confidentiality.",
    date: "2026-09-27",
    readMinutes: 5,
    related: [
      "/blog/linkedin-ghostwriting-pricing",
      "/blog/client-approval-workflow-for-social-posts",
      "/blog/brand-voice-for-linkedin",
      "/blog/manage-multiple-linkedin-accounts",
    ],
    blocks: [
      {
        type: "p",
        text: "To start a LinkedIn ghostwriting business, pick one kind of client you understand, learn to capture their voice in a single intake call, and deliver a steady month of posts they approve before anything goes out. The first three clients usually come from people who already know your work, and the contract matters more than the website: it has to say who approves posts, who controls the account, and what happens to the numbers clients share with you.",
      },
      {
        type: "p",
        text: "The rest of this guide goes through each of those in the order you will meet them.",
      },
      { type: "h2", text: "Pick a niche you can write about without research" },
      {
        type: "p",
        text: "A ghostwriter who writes for everyone has to learn a new industry for every client. That is slow, and it shows in the drafts. A ghostwriter who writes for founders of accounting software, or for partners at small law firms, or for independent recruiters in tech, already knows the vocabulary, the arguments and the common mistakes. The first draft is closer, the revisions are fewer, and the client trusts you sooner.",
      },
      {
        type: "p",
        text: "A useful test: could you list twenty post ideas for this kind of client right now, without looking anything up? If yes, it is a niche you can serve. If you stall at five, pick something closer to your own work history.",
      },
      {
        type: "list",
        items: [
          "Choose a kind of person over an industry. 'Founders of B2B software with ten to fifty staff' is a niche. 'Tech' is too wide to be one.",
          "Choose people who have things to say but no time to write. Busy operators are better clients than people who want to become influencers.",
          "Choose people who can afford a monthly retainer. A niche full of early freelancers will struggle to pay one.",
        ],
      },
      { type: "h2", text: "What to cover in the intake call" },
      {
        type: "p",
        text: "The intake call is where you collect the raw material for the first month. Record it with permission, because the client's own sentences are the best source of their voice you will ever get. An hour is usually enough.",
      },
      {
        type: "steps",
        items: [
          "Ask what they want LinkedIn to do for them: clients, hires, investors, speaking invitations. The answer shapes every post.",
          "Ask who they want to reach, by job title and situation. 'Heads of finance at companies that raised a round this year' is something you can write to.",
          "Ask for three stories: a mistake they learned from, a result they are proud of, and an argument they keep having with peers.",
          "Ask which numbers they are happy to share in public and which are off limits. Write both lists down.",
          "Ask for two or three posts by other people they like, and one they dislike. The dislike is often more useful.",
          "Agree the cadence and the approval deadline before you hang up.",
        ],
      },
      { type: "h2", text: "How to capture a client's voice" },
      {
        type: "p",
        text: "Voice is a set of habits: sentence length, how formal they are, whether they use humour, which words they would never say. Listen back to the recording and write those habits down as short rules. 'Short sentences. No exclamation marks. Says customers, never users. Explains with a story from a client, then the lesson.' Four or five rules like that are more useful than a page of adjectives.",
      },
      {
        type: "p",
        text: "If the client has posted before, read their old posts too. LinkedIn does not let a new app read a member's post history, but the client can download their own archive from Settings, Data privacy, Get a copy of your data. The posts are in a file called Shares.csv with the date, the link and the full text. Ask for it in the first week.",
      },
      {
        type: "p",
        text: "Every revision the client asks for is a new rule. Keep the list in one place and update it each time, so you never make the same correction twice.",
      },
      { type: "h2", text: "What to deliver in the first month" },
      {
        type: "p",
        text: "The first month sets the expectations for the rest of the relationship, so make it predictable before you make it clever.",
      },
      {
        type: "list",
        items: [
          "A short voice document: the rules you wrote, the topics you agreed, and the numbers that are off limits.",
          "Three or four themes the posts will rotate through, so the feed does not repeat itself by week three.",
          "The agreed number of posts, delivered as drafts at least a week before each goes out.",
          "A simple calendar showing what goes out when.",
          "A short note at the end of the month: what was posted, what the client changed, and what you will do differently.",
        ],
      },
      { type: "h2", text: "How to get your first three clients" },
      {
        type: "p",
        text: "The first clients rarely come from strangers. They come from people who already trust your judgement: former colleagues, former managers, clients from a previous job, founders you have helped informally.",
      },
      {
        type: "steps",
        items: [
          "Post on your own profile first, on a steady rhythm, about the niche you picked. It is the portfolio a prospect will check.",
          "Write a list of twenty people in that niche who already know you. Send each a short, personal note saying what you now do and who it is for.",
          "Offer the first client a fixed trial period, for example one month, with a clear end date and a clear price after it.",
          "Ask each happy client for one introduction to a peer. Founders know other founders.",
        ],
      },
      { type: "h2", text: "What to put in a ghostwriting contract" },
      {
        type: "p",
        text: "Most disputes in this business come from three questions nobody answered at the start. Put all three in writing before the first draft.",
      },
      {
        type: "list",
        items: [
          "Approval rights. Nothing is published without the client's approval. Say how they approve (a board, an email, a message), how long they have, and what happens if they do not answer. The safe default is that an unapproved post does not go out.",
          "Who owns the account. The LinkedIn profile belongs to the client, always. You should never hold their password. Use a tool where the client connects their own profile, and say in the contract that access ends when the engagement does.",
          "Confidentiality of client numbers. Clients will tell you revenue, churn, deal sizes and names of customers. The contract should say that you use these only for their posts, only with their approval, and never in your own marketing or case studies without written permission.",
          "Who owns the writing. Usually the client, once paid. Say so, and say whether you may show anonymised samples to prospects.",
          "Notice period and payment terms. Monthly, in advance, with a notice period of one month is a common shape.",
        ],
      },
      {
        type: "p",
        text: "Have a lawyer in your country read the template once. It is a small cost against the one argument it prevents.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "On the Agency plan, each client gets their own board, four themes and three brand principles, and each client connects their own LinkedIn profile, so you never hold a password. The agent writes the drafts from the client's website and the themes you set, and nothing moves to Scheduled until someone approves it.",
      },
      {
        type: "p",
        text: "When you revise a card with a comment, the card is rewritten and the matching principle is updated, which is the voice document from this guide kept up to date for you. A client's past posts can be imported from their Shares.csv file and shown on the calendar as background.",
      },
    ],
  },
  {
    slug: "linkedin-ghostwriting-pricing",
    title: "LinkedIn ghostwriting pricing: how much to charge",
    description:
      "Charge by monthly retainer tied to cadence, and set your floor from your hours, your tool costs and the income you need, before you look at anyone else's rates.",
    date: "2026-09-27",
    readMinutes: 5,
    related: [
      "/blog/start-a-linkedin-ghostwriting-business",
      "/blog/linkedin-ghostwriter-vs-ai",
      "/blog/manage-multiple-linkedin-accounts",
      "/blog/how-often-to-post-on-linkedin",
    ],
    blocks: [
      {
        type: "p",
        text: "Most LinkedIn ghostwriters charge a monthly retainer tied to how many posts go out, and the right price starts with your floor: the hours each client takes, the tools you pay for, and the income you need, worked out before you look at what anyone else charges. Published market rates vary so widely, and are so rarely verifiable, that they make a poor starting point. Your own arithmetic is a better one.",
      },
      {
        type: "p",
        text: "This guide covers the common pricing models, which ones hold up, and how to calculate a floor you should never go under.",
      },
      { type: "h2", text: "The four common pricing models" },
      {
        type: "list",
        items: [
          "Per post. The client pays a fixed amount for each post. Easy to explain, easy to start with, and easy for the client to pause, which makes your income hard to predict.",
          "Monthly retainer by cadence. The client pays a fixed monthly fee for a set rhythm, for example three posts a week. This is the most common model and the one most ghostwriters settle on.",
          "Tiered retainer with calls. Higher tiers add more posts, a monthly strategy call, comment support or help with a newsletter. Useful once you know which extras clients ask for.",
          "Performance add-ons. A bonus tied to followers, impressions, leads or inbound messages. Tempting, and risky for reasons covered below.",
        ],
      },
      { type: "h2", text: "Why a retainer by cadence works best" },
      {
        type: "p",
        text: "What a client buys from a ghostwriter is a steady presence on LinkedIn without the writing. A retainer tied to cadence prices exactly that. It also matches how the work runs: the intake, the voice notes and the theme planning are a fixed cost per client, and they are spread over every post in the month.",
      },
      {
        type: "p",
        text: "Per-post pricing tends to punish you for the setup. The first month of any client is the slowest, and a client who buys six posts and stops has paid for the easy part and left you the hard part. If you do sell per post, charge a setup fee or a minimum number of posts.",
      },
      { type: "h2", text: "Why performance pricing is risky" },
      {
        type: "p",
        text: "LinkedIn does not publish how its feed ranks posts, and it changes over time. A bonus tied to reach or followers ties your income to a system neither you nor the client controls. A strong post can go quiet for reasons that have nothing to do with the writing.",
      },
      {
        type: "list",
        items: [
          "The client controls half the inputs. Whether they reply to comments, how often they approve on time, and whether they post other things in between all move the result.",
          "Leads are hard to attribute. A prospect who read ten posts and then booked a call after a referral will be counted differently by you and by the client.",
          "It rewards the wrong posts. Chasing reach pulls the writing toward broad, safe topics and away from the specific posts that bring the right buyers.",
        ],
      },
      {
        type: "p",
        text: "If a client insists on a performance element, keep it small, tie it to something you control, like posts published on schedule, and keep the base retainer at or above your floor.",
      },
      { type: "h2", text: "How to calculate your floor" },
      {
        type: "p",
        text: "Your floor is the lowest monthly price per client at which the business pays you what you need. Work it out from four numbers.",
      },
      {
        type: "steps",
        items: [
          "Hours per client per month. Count everything: calls, drafting, revisions, scheduling, messages, the monthly report. Time yourself for a month if you can.",
          "Your target hourly income. What you want to earn per working hour after costs, before tax.",
          "Tool costs per client per month. Writing tools, a scheduler, image generation, a shared drive, divided across the clients you run.",
          "Unbilled time. Sales calls, your own posting, admin and invoicing. Add a share of it to every client, because someone has to pay for it.",
        ],
      },
      { type: "h2", text: "A worked example" },
      {
        type: "p",
        text: "The figures below are hypothetical, round numbers chosen to show the arithmetic. Put your own in their place.",
      },
      {
        type: "p",
        text: "For example, say each client takes 12 hours a month at twelve posts a month, and you want to earn 75 an hour. That is 900 a month of your time per client. Add a quarter for unbilled time, 225, and you are at 1,125.",
      },
      {
        type: "p",
        text: `Now the tools. Suppose you run eight clients on GoodSocials' Agency plan, which is $1,000 a month for up to ${AGENCY_SEATS} profiles. Across eight clients that is 125 a month each. Your floor becomes 1,250 a month per client at that cadence, and anything below it means you are paying to work.`,
      },
      {
        type: "p",
        text: "The tool line also changes the hours line. If drafting took most of the 12 hours and an AI agent now writes the first draft, the hours drop, and the floor drops with them. That gives you a choice: lower the price to win more clients, or keep the price and take on more clients in the same week.",
      },
      { type: "h2", text: "Setting the price above the floor" },
      {
        type: "p",
        text: "The floor is the lowest you go. Price above it according to what the client gets.",
      },
      {
        type: "list",
        items: [
          "Cadence. More posts a week means more ideas, more drafts and more approvals. Price each step up in the rhythm, not each extra post.",
          "Access to the client. A client who gives you a monthly call and shares real numbers produces better posts with less of your time.",
          "Your niche. A ghostwriter who knows a field deeply saves the client the time it would take to explain it.",
          "Extras. Comment support, a newsletter, or carousels each take real hours and belong in a higher tier.",
        ],
      },
      { type: "h2", text: "How to raise your prices" },
      {
        type: "p",
        text: "Raise prices for new clients first. Once three new clients in a row say yes without hesitation, your price is probably low. For existing clients, give a notice period of at least a month and tie the change to something concrete, like a higher cadence or a new tier.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: `The Agency plan is ${AGENCY.priceLine} for up to ${AGENCY_SEATS} client profiles, each with its own board, themes and principles, so the tool cost per client is a number you can put in the floor calculation. The agent writes the first draft, which is usually where the hours go, and you spend your time on review and on the client.`,
      },
      {
        type: "p",
        text: "The dashboard for each profile leads with posts published this month and the current streak, which is the thing a cadence retainer promises and the thing you can show a client at the end of the month.",
      },
    ],
  },
  {
    slug: "manage-multiple-linkedin-accounts",
    title: "How to manage multiple LinkedIn accounts for clients",
    description:
      "Never hold client passwords. Have each client authorise your tool, keep one board per client, and track the 60 day reconnect so no queue dies in silence.",
    date: "2026-09-27",
    readMinutes: 4,
    related: [
      "/blog/client-approval-workflow-for-social-posts",
      "/blog/how-to-schedule-linkedin-posts",
      "/blog/start-a-linkedin-ghostwriting-business",
      "/blog/personal-profile-vs-company-page",
    ],
    blocks: [
      {
        type: "p",
        text: "To manage multiple LinkedIn accounts for clients, have each client connect their own profile to a scheduling tool through LinkedIn's official sign in, so you never hold a password, and keep one separate board of posts per client. The part most agencies miss is that LinkedIn access for third-party apps expires after 60 days with no automatic renewal, so you need a way to see which client has to reconnect, and when, before their scheduled posts stop going out.",
      },
      {
        type: "p",
        text: "Here is how each piece works and what to watch for.",
      },
      { type: "h2", text: "Why you should never hold client passwords" },
      {
        type: "p",
        text: "Logging in as a client with their email and password feels like the quick route. It causes problems that grow with every client you add.",
      },
      {
        type: "list",
        items: [
          "LinkedIn's user agreement does not allow sharing an account with someone else. A login from your laptop in another city can trigger a security check that locks the client out of their own profile.",
          "Two-step verification sends codes to the client's phone. Every login becomes a message asking them for a code, often at a bad time.",
          "You now hold the keys to their inbox, their connections and their job history. If your laptop or password manager is compromised, so are they.",
          "When the engagement ends, the client has to change their password and hope nothing else was saved. That is an awkward way to part.",
        ],
      },
      { type: "h2", text: "Each client authorises the app themselves" },
      {
        type: "p",
        text: "LinkedIn offers an official route for tools to post on a member's behalf. The member signs in on LinkedIn's own page, sees what the app is asking for, and approves it. The tool receives a token that lets it post to that member's feed and nothing else. The password never leaves LinkedIn.",
      },
      {
        type: "steps",
        items: [
          "Invite the client to connect. Send a link from your tool, or sit with them on a short call while they do it.",
          "The client signs in with LinkedIn and approves the permissions.",
          "Check that the profile shows as connected in your tool before you schedule anything.",
          "When the engagement ends, the client can remove the app from their LinkedIn settings at any time, and your access ends with it.",
        ],
      },
      {
        type: "p",
        text: "This works for personal profiles. Posting as a company page goes through a separate LinkedIn programme that requires approval, so check what your tool supports before you promise it to a client.",
      },
      { type: "h2", text: "The 60 day reconnect" },
      {
        type: "p",
        text: "Access tokens LinkedIn gives third-party apps last 60 days, and standard apps do not get a way to renew them without the member. That means every tool that posts for a client has to ask that client to sign in again about every 60 days. The rule comes from LinkedIn and applies to every tool.",
      },
      {
        type: "p",
        text: "With one client it is easy to remember. With eight clients who all connected on different days, the dates spread across the calendar and one of them will slip. Track it the same way you track invoices.",
      },
      {
        type: "list",
        items: [
          "Record the date each client connected, and the date 60 days later.",
          "Set a reminder at day 50 to ask the client to reconnect. It takes them a minute, but they need warning.",
          "Check again at day 55. If they have not done it, message them directly.",
          "Put the reconnect in the contract as something the client agrees to do when asked, so the request never feels like a favour.",
        ],
      },
      { type: "h2", text: "The silent failure of a dead token" },
      {
        type: "p",
        text: "When a token expires, nothing breaks on the client's screen. Their profile looks normal. The posts you scheduled never appear, and LinkedIn sends nobody an alert. It is common to find out weeks later, when the client asks why they have been quiet, and by then the streak you were paid to keep is gone.",
      },
      {
        type: "p",
        text: "Ask any tool you use two questions. Does it warn you before a client's access expires? And when a token does die, does it pause that client's queue and tell you, or does it keep trying and failing post by post where nobody looks?",
      },
      { type: "h2", text: "One board per client" },
      {
        type: "p",
        text: "Mixing clients in one calendar is how a post meant for one person ends up on another person's feed. Keep a separate board for each client, with their own ideas, drafts, approvals and schedule.",
      },
      {
        type: "list",
        items: [
          "Each board has its own themes, so one client's topics never leak into another's.",
          "Each board has its own voice notes, so a correction for one client does not change how another sounds.",
          "Each board has its own posting time in the client's timezone, which matters when clients sit in different countries.",
        ],
      },
      { type: "h2", text: "Rate limits across many accounts" },
      {
        type: "p",
        text: "LinkedIn limits how many API calls an app can make for each member each day: 150 per member per day, reset at midnight UTC. Publishing one post takes a few calls, and a post with an image takes more, because the image is uploaded in separate steps. For a normal cadence of one post a day, this limit is far away.",
      },
      {
        type: "p",
        text: "It matters when something goes wrong. A tool that retries a failing post every few minutes can burn a client's daily allowance on one broken post. Good tools count calls before they make them and stop well before the limit.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: `On the Agency plan, each client connects their own LinkedIn profile, up to ${AGENCY_SEATS} profiles, and each gets its own board, themes and principles. GoodSocials emails you on day 50 of a client's connection, shows a banner on day 55, and on day 60 marks the connection dead and pauses that client's schedule instead of letting posts fail one by one.`,
      },
      {
        type: "p",
        text: "Every LinkedIn call is counted against the 150 per member per day before it is made, and the publish loop stops before the limit. A failed publish records the attempt and the error, so you can see what happened to each post.",
      },
    ],
  },
  {
    slug: "client-approval-workflow-for-social-posts",
    title: "A social media approval workflow for client posts",
    description:
      "Move each post through set stages, give the client one clear approval step with a deadline, never publish unapproved posts, and log every decision.",
    date: "2026-09-27",
    readMinutes: 4,
    related: [
      "/blog/manage-multiple-linkedin-accounts",
      "/blog/start-a-linkedin-ghostwriting-business",
      "/blog/brand-voice-for-linkedin",
      "/blog/linkedin-content-calendar",
    ],
    blocks: [
      {
        type: "p",
        text: "A good social media approval workflow moves every post through the same stages, from idea to draft to approved to scheduled, with one named person who approves and a deadline for doing it. If the client does not answer by the deadline, the post does not go out. Every approval, revision and rejection is written down, so the same feedback never has to be given twice.",
      },
      {
        type: "p",
        text: "Here is how to set that up for client work, and how to handle the parts that usually go wrong.",
      },
      { type: "h2", text: "The stages a post moves through" },
      {
        type: "p",
        text: "Fewer stages are easier to run. Each one should have a clear owner and a clear exit.",
      },
      {
        type: "steps",
        items: [
          "Idea. A one-line description of the post and the theme it belongs to. Cheap to reject, so reject freely.",
          "Draft. The full text. This is where most revisions happen.",
          "Image. The visual, if the post has one, checked against the text.",
          "Scheduled. Approved and waiting for its slot. Nothing enters this stage without approval.",
          "Posted. Live on the feed, with the link recorded.",
        ],
      },
      {
        type: "p",
        text: "A board with one column per stage makes the whole pipeline visible at a glance. You can see what is waiting on you, what is waiting on the client, and how many days of approved posts are left in the queue.",
      },
      { type: "h2", text: "Who approves" },
      {
        type: "p",
        text: "One person per client. When two people at the client can approve, each assumes the other did, or they approve different versions. Name the approver in the contract and in your tool.",
      },
      {
        type: "p",
        text: "For a founder or executive posting on their own profile, the approver should be that person. Their name is on the post. An assistant or marketing lead can collect feedback, but the final yes belongs to the person whose feed it lands on.",
      },
      { type: "h2", text: "Set deadlines for approval" },
      {
        type: "p",
        text: "Without a deadline, approval drifts toward the morning of the post, and then past it. Agree a rhythm at the start and keep it the same every week.",
      },
      {
        type: "list",
        items: [
          "Drafts reach the client a fixed number of days before they go out, for example one week.",
          "The client approves by a fixed day, for example Thursday for the following week.",
          "Batch the requests. One message a week with five drafts gets answered. Five separate messages get ignored.",
          "Keep a queue of approved posts a few days deep, so one slow week does not leave a gap.",
        ],
      },
      { type: "h2", text: "What to do when a client goes silent" },
      {
        type: "p",
        text: "It will happen. The client is travelling, closing a round or on holiday. The temptation is to publish the drafts anyway, because the cadence is what they are paying for. Do not do it.",
      },
      {
        type: "p",
        text: "A post goes out under the client's name. An unapproved post with a number they did not want public, or a view they no longer hold, costs more trust than a missed week ever will. Agree the rule in the contract: unapproved posts do not publish.",
      },
      {
        type: "steps",
        items: [
          "Send one reminder the day before the deadline, with the drafts attached or linked.",
          "If the deadline passes, the scheduled approved posts keep going out as planned. Unapproved ones wait.",
          "If the queue runs dry, send a short note saying the feed will go quiet from a given date until drafts are approved.",
          "When the client is back, offer a single short session to clear the backlog.",
        ],
      },
      {
        type: "p",
        text: "Some agencies ask clients to approve a small reserve of evergreen posts in advance, for exactly these weeks. It keeps the cadence without breaking the rule.",
      },
      { type: "h2", text: "Capture feedback so it is not repeated" },
      {
        type: "p",
        text: "The most frustrating thing for a client is giving the same note twice. 'I never say synergy.' 'Do not mention that customer by name.' 'Shorter opening.' If the second draft of the month repeats a mistake from the first, the client starts to wonder what they are paying for.",
      },
      {
        type: "list",
        items: [
          "Keep one short document per client with their rules: voice, format, topics to avoid, numbers that are off limits.",
          "After every revision, ask whether the note applies to this post only or to every post. If every post, add it to the rules.",
          "Read the rules before drafting, every time. It takes a minute.",
          "Share the rules with the client once a quarter so they can correct anything that has drifted.",
        ],
      },
      { type: "h2", text: "Keep an approval log" },
      {
        type: "p",
        text: "An approval log is a plain record of who decided what, and when. Each entry has the post, the action (approved, revised or rejected), the person, the date, and any comment.",
      },
      {
        type: "p",
        text: "It settles disagreements. When a client asks why a post went out, you can show that they approved it on a given day. When they ask why the feed was quiet, you can show that drafts were sent and not answered. It also shows you patterns: a client who rejects most ideas from one theme is telling you the theme is wrong.",
      },
      {
        type: "p",
        text: "Never overwrite the log. If a post was revised three times, keep all three entries. The history is the point.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "Every client profile has a board with five columns, Idea, Draft, Image, Scheduled and Posted, and every card has three actions: Approve, Revise and Reject. Nothing reaches Scheduled without an approval, and the publish loop only posts what is scheduled, so an unapproved card waits however long the client is away.",
      },
      {
        type: "p",
        text: "Each action is written to an append-only log with the person and the comment. A revise comment rewrites the card and updates the matching brand principle for that client, voice, visual or format, so the note carries into every later post without anyone keeping the rules document by hand.",
      },
    ],
  },
  {
    slug: "linkedin-ghostwriter-vs-ai",
    title: "LinkedIn ghostwriter vs AI: which should you use?",
    description:
      "A ghostwriter brings interviews, taste and relationships. AI brings volume and never misses a day. The best setups have a human approve AI drafts.",
    date: "2026-09-27",
    readMinutes: 4,
    related: [
      "/blog/writing-with-ai-without-sounding-like-ai",
      "/blog/linkedin-ghostwriting-pricing",
      "/blog/best-ai-tools-for-linkedin",
      "/compare/chatgpt",
    ],
    blocks: [
      {
        type: "p",
        text: "A human LinkedIn ghostwriter is better at interviewing you, judging what is worth saying, and knowing the people in your field. AI is better at producing drafts quickly, in volume, and on schedule without missing a day. For most people the strongest option is a hybrid: AI writes the first draft from your material, and a human, either you or a ghostwriter, edits and approves every post before it goes out.",
      },
      {
        type: "p",
        text: "Below is a fair look at both, and how to decide which mix suits you.",
      },
      { type: "h2", text: "What a human ghostwriter does better" },
      {
        type: "list",
        items: [
          "Interviews. A good ghostwriter asks the follow-up question that turns a vague memory into a specific story. AI can only work with what it is given.",
          "Taste. Knowing which of ten true things is worth posting, and which one would embarrass you in front of a client, is judgement built from years of reading and writing.",
          "Relationships. A ghostwriter in your niche knows who the other voices are, which debates are live, and when a topic has been done to death.",
          "Reading the room. After a layoff, a bad quarter or an industry scandal, a human knows to hold a cheerful post. A scheduled draft does not.",
          "Accountability. When something goes wrong, there is a person to talk to who understands what happened.",
        ],
      },
      { type: "h2", text: "What AI does well" },
      {
        type: "list",
        items: [
          "Volume. A week of drafts in minutes, which gives you more to choose from and more room to reject weak ideas.",
          "First drafts. Most of the time in writing goes into the blank page. A draft to react to is faster to fix than to start.",
          "Never missing a day. An agent does not get sick, go on holiday or lose interest in March. The queue keeps filling.",
          "Consistency across topics. Given a list of themes, it rotates through them without drifting back to the same three ideas.",
          "Cost per draft. The price of generating text is small next to the price of an hour of skilled writing.",
        ],
      },
      { type: "h2", text: "Where AI goes wrong" },
      {
        type: "p",
        text: "AI drafts fail in predictable ways. They invent numbers that sound plausible. They make claims the author cannot support. They produce posts that are smooth and say nothing. And they drift toward the same phrasing everyone else's AI drafts use, which readers learn to spot quickly.",
      },
      {
        type: "p",
        text: "The answer to all four is the same: a person reads every AI draft before it is published.",
      },
      { type: "h2", text: "Where a ghostwriter alone falls short" },
      {
        type: "p",
        text: "The weak point of a solo ghostwriter is capacity. Every client adds hours, and the hours are mostly drafting. When the ghostwriter is ill or overbooked, the posts stop. And a ghostwriter's time is expensive, so many people who would benefit from steady posting cannot afford the cadence they need.",
      },
      { type: "h2", text: "The hybrid: a human edits and approves AI drafts" },
      {
        type: "p",
        text: "The setup that holds up best splits the work by what each side is good at.",
      },
      {
        type: "steps",
        items: [
          "A human sets the direction: the goal, the themes, the voice rules and the numbers that are off limits.",
          "The AI writes ideas and drafts across those themes, and keeps the queue full.",
          "A human reads every draft, cuts what says nothing, adds the story or number only the author knows, and fixes the voice.",
          "The author approves, and only then does the post get a slot.",
          "Every correction becomes a rule the AI follows next time, so the edits get lighter each week.",
        ],
      },
      {
        type: "p",
        text: "For a founder with time to review, the human in that loop can be the founder. For a founder without time, it is a ghostwriter who now spends their hours on interviews and judgement instead of first drafts.",
      },
      { type: "h2", text: "How to compare the cost" },
      {
        type: "p",
        text: "Rates for ghostwriters vary too much to quote a fair market figure, so compare with your own numbers instead. Ask two questions.",
      },
      {
        type: "list",
        items: [
          "How many hours a month does the writing take? Multiply by what that time costs, whether it is your time or a ghostwriter's.",
          "How many of those hours are first drafts? That is the part AI takes over. What is left, review and interviews, is the part worth paying a human for.",
        ],
      },
      {
        type: "p",
        text: "For a ghostwriter, the same arithmetic works in reverse. If an AI tool cuts drafting time per client, you can serve more clients in the same week, or spend the saved hours on the interviews and editing that clients value most.",
      },
      { type: "h2", text: "Which should you choose" },
      {
        type: "list",
        items: [
          "Choose a human ghostwriter alone if your posts depend on long interviews, sensitive topics or a voice that takes a person to get right, and the budget allows it.",
          "Choose AI with your own review if you have clear opinions, twenty minutes a week to approve drafts, and want to post most days.",
          "Choose the hybrid if you want a person's judgement on every post and a cadence one person alone would struggle to keep.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials is built for the hybrid. The agent writes ideas and drafts across four themes per profile, and a person approves, revises or rejects every card before it can be scheduled. A quality gate holds drafts with invented numbers or unsupported claims, and when a post needs a figure only the author has, the card asks for it instead of making one up.",
      },
      {
        type: "p",
        text: `A revise comment rewrites the card and updates the profile's brand principles, so a ghostwriter's corrections carry into every later draft. On the Agency plan, one ghostwriter can run up to ${AGENCY_SEATS} client profiles this way, each with its own board.`,
      },
    ],
  },
];
