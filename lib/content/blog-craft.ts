import type { BlogPost } from "./types";
import { IMAGE_CAP_PER_MONTH } from "@/lib/legal";

/** Templates, ideas, calendars, carousels and repurposing: the searches about what to post and how to plan it. */
export const CRAFT_POSTS: BlogPost[] = [
  {
    slug: "linkedin-post-templates",
    title: "LinkedIn post templates that do not read like templates",
    description:
      "Ten fill-in-the-blank LinkedIn post templates, grouped by framework, data, receipt and finding, each with a filled example from a small business.",
    date: "2026-09-27",
    readMinutes: 6,
    blocks: [
      {
        type: "p",
        text: "A good LinkedIn post template is a shape, a short sequence of slots you fill with something only you know. The ten below are grouped by the four kinds of post that hold up over a year of posting: frameworks, data, receipts and findings. Each one comes with a filled example from a believable small business, so you can see the slots with real material in them.",
      },
      {
        type: "p",
        text: "One warning before the templates. Readers have seen thousands of posts built from the same scaffolding, and they recognise it in a line. The template is for you, while you draft. By the time the post goes out, nobody should be able to see it.",
      },
      { type: "h2", text: "How to use a template without sounding like one" },
      {
        type: "list",
        items: [
          "Fill every slot with a specific: a name, a number, a date, a place. A template filled with generalities is the post everyone has already scrolled past.",
          "Delete the connecting phrases once the draft works. 'Here is what I learned' and 'Let me explain' are scaffolding.",
          "Break the order when the material asks for it. If the result is the most interesting part, it goes first, whatever the template says.",
          "If you cannot fill a slot honestly, do not write the post yet. An empty slot means you need a fact, not better wording.",
        ],
      },
      { type: "h2", text: "Framework templates" },
      {
        type: "p",
        text: "A framework is a method the reader can apply, in named steps, in an order that matters. It has to come from something you have done more than once. If the steps would fit any company, it is a listicle wearing a framework's clothes.",
      },
      { type: "p", text: "Template 1: the ordered method." },
      {
        type: "list",
        items: [
          "Line 1: the task, and who it is for.",
          "Line 2: how many times you have done it, or for whom.",
          "Steps: three to five, each with a name and one sentence on why it comes in that order.",
          "Close: the step people skip, and what skipping it costs.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Four checks Harbour Bookkeeping runs before a client's first VAT return. Drawn from 60 first returns filed since 2023. Match the bank feed to the invoices first. Confirm the registration date. List every foreign supplier. Book a ten minute call before filing. Most clients want to skip the call. It is where the missing invoices turn up.'",
      },
      { type: "p", text: "Template 2: the three questions." },
      {
        type: "list",
        items: [
          "Line 1: the decision the reader is about to make.",
          "Questions: three, each one something you ask clients, with the answer that should worry them.",
          "Close: what to do if two of the three answers are the worrying ones.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Three questions Northside Studio asks before quoting a website rebuild. Who updates the site today? If the answer is nobody, a new site will not change that. Which pages brought an enquiry last year? If nobody knows, measure first. What has to launch by a date? If everything does, the scope is wrong.'",
      },
      { type: "p", text: "Template 3: the checklist with a reason per line." },
      {
        type: "list",
        items: [
          "Line 1: the moment the checklist is for.",
          "Items: five or six, each with a clause on what goes wrong without it.",
          "Close: the one item that caught the most problems.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'The checklist Fernhill Physio uses before a new clinic opens online booking. Test the confirmation email on a phone. Set a buffer between appointments. Block bank holidays a year out. Name a person who reads the cancellations inbox. The buffer caught more problems than the other three combined.'",
      },
      { type: "h2", text: "Data templates" },
      {
        type: "p",
        text: "A data post takes one fact from outside your business and says what it means for your reader. Name the source exactly: the organisation, the document, the year. If you cannot name it, do not write the post.",
      },
      { type: "p", text: "Template 4: the public number and its consequence." },
      {
        type: "list",
        items: [
          "Line 1: the number, with its source and date.",
          "Line 2: who it affects.",
          "Body: what that person should do differently this month.",
          "Close: where to check the figure yourself.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'The UK VAT registration threshold rose to 90,000 GBP on 1 April 2024, per HMRC. For a sole trader billing around 7,000 GBP a month, that is the difference between registering this year and next. Harbour Bookkeeping now checks rolling 12 month turnover at every quarter end instead of once a year. The threshold is on gov.uk.'",
      },
      { type: "p", text: "Template 5: the number that has not moved." },
      {
        type: "list",
        items: [
          "Line 1: a figure people assume has changed, and the date it was last set.",
          "Body: what has changed around it.",
          "Close: the decision that follows for your reader.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'The US federal minimum wage has been 7.25 USD an hour since July 2009, per the Department of Labor. Many states and cities set their own, higher rates. Shiftwise, a payroll service for restaurants with sites in several states, sets pay per location for that reason and never from the federal figure.'",
      },
      { type: "h2", text: "Receipt templates" },
      {
        type: "p",
        text: "A receipt is a number from your own business. It is credible because it is yours, so the number must be real. If you do not have it yet, leave the slot empty and go and get it.",
      },
      { type: "p", text: "Template 6: before, change, after." },
      {
        type: "list",
        items: [
          "Line 1: the after, as a number.",
          "Line 2: the before, same unit, same period length.",
          "Body: the one change in between, described closely enough to copy.",
          "Close: what the change cost, in time or money.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Northside Studio's proposals took 3 days to turn around in June. In August they took 1. The change: a fixed menu of four packages, so a proposal is a choice rather than a document. It cost two afternoons to write the menu and one client who wanted something off it.'",
      },
      { type: "p", text: "Template 7: the count." },
      {
        type: "list",
        items: [
          "Line 1: how many of something it took.",
          "Body: what the first few looked like against the last few.",
          "Close: what you would do from number one if you started again.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'It took Fernhill Physio 41 calls to local GP practices to get the first 5 referral agreements. The first 20 calls asked for referrals. The last 21 offered a free assessment slot each week. Starting again, the clinic would open with the slot.'",
      },
      { type: "p", text: "Template 8: the cost of a mistake." },
      {
        type: "list",
        items: [
          "Line 1: what it cost, in a number.",
          "Line 2: what the decision was.",
          "Body: the signal that was visible at the time.",
          "Close: the rule the business follows now.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Shiftwise spent 4 months building a scheduling feature that 3 customers used. It was the most requested item on the roadmap. The signal was there: every request came from a sales call, none from a support ticket. The rule now is that nothing gets built from sales call requests alone.'",
      },
      { type: "h2", text: "Finding templates" },
      {
        type: "p",
        text: "A finding is something you found out and can point to. It often contradicts what you expected, which is what makes it worth reading.",
      },
      { type: "p", text: "Template 9: expected, found." },
      {
        type: "list",
        items: [
          "Line 1: what you expected, in one sentence.",
          "Line 2: what you found instead, and how you found it.",
          "Close: what you changed because of it.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Harbour Bookkeeping expected clients to leave over price. Reading the last 12 exit emails, 9 of them mentioned a missed deadline and none mentioned price. The firm now sends a deadline calendar in the first week of every engagement.'",
      },
      { type: "p", text: "Template 10: the pattern across clients." },
      {
        type: "list",
        items: [
          "Line 1: how many cases you looked at.",
          "Line 2: the pattern.",
          "Body: one case that shows it clearly.",
          "Close: the exception, because there always is one.",
        ],
      },
      {
        type: "p",
        text: "Filled: 'Northside Studio looked at the last 15 site launches. The ones that went live on time all had final copy before design started. One launched on time without it, because the client wrote every page during the design review. That client was a copywriter.'",
      },
      { type: "h2", text: "Templates to avoid" },
      {
        type: "list",
        items: [
          "The one-line opener followed by a blank line and 'Here's why.' Readers see the scaffolding before the subject.",
          "The humble brag framed as a lesson. 'I was nervous to share this, but we hit seven figures.'",
          "The list of ten tips with no source for any of them.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials decides each idea's kind, framework, data, receipt or finding, before any text is written, and most of each batch is frameworks, data and receipts. When a receipt needs a number only you have, the card names it and the draft leaves a bracketed gap until you supply it in a revise comment. A quality check holds any draft with an invented number before it can be scheduled.",
      },
    ],
    related: [
      "/blog/linkedin-post-ideas",
      "/blog/receipts-beat-opinions",
      "/blog/how-to-write-a-linkedin-post",
      "/blog/chatgpt-prompts-for-linkedin-posts",
    ],
  },
  {
    slug: "linkedin-post-ideas",
    title: "48 LinkedIn post ideas for founders and consultants",
    description:
      "48 LinkedIn post ideas grouped by where they come from: client questions, your own numbers, mistakes, decisions, tools, hiring and what you read.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "The best LinkedIn post ideas come from your own work: the questions clients ask, the numbers in your tools, the mistakes you fixed and the decisions you made. Below are 48 ideas grouped by those sources, each marked with the kind of post it becomes: a framework, a data post, a receipt or a finding. Pick the ones where you already have the material, and you have a month of posts.",
      },
      {
        type: "p",
        text: "Every idea here needs something only you can add. That is deliberate. An idea anyone could write is the post nobody remembers.",
      },
      { type: "h2", text: "Where good post ideas come from" },
      {
        type: "p",
        text: "Ideas rarely arrive on a Monday morning in front of an empty draft. They turn up during the week, in a client call or a spreadsheet, and disappear if nobody writes them down. Keep one running note on your phone and add a line whenever something surprises you. By Friday you will have more than you can post.",
      },
      { type: "h2", text: "Ideas from client questions" },
      {
        type: "list",
        items: [
          "Framework: the question every new client asks in the first call, answered in three steps.",
          "Framework: how you decide whether a prospect is a good fit, as the questions you ask.",
          "Finding: a question clients stopped asking this year, and what changed.",
          "Framework: the answer you give when a client asks 'how long will this take'.",
          "Finding: the question you wish clients asked, and what it would save them.",
          "Receipt: how many of last quarter's enquiries asked about price first, and what you did about it.",
          "Framework: what to prepare before the first meeting with someone in your field.",
        ],
      },
      { type: "h2", text: "Ideas from numbers you own" },
      {
        type: "list",
        items: [
          "Receipt: revenue this month against the same month last year, and the one change behind the gap.",
          "Receipt: how long a typical project takes now against two years ago.",
          "Receipt: your win rate on proposals, and what the lost ones had in common.",
          "Receipt: where your last ten customers first heard of you.",
          "Receipt: how many hours a week go to admin, measured for one month.",
          "Receipt: the price you charged your first client, and the price for the same work today.",
          "Finding: which page on your website brings the most enquiries, and whether it is the one you expected.",
        ],
      },
      { type: "h2", text: "Ideas from mistakes" },
      {
        type: "list",
        items: [
          "Receipt: a project that lost money, with the figure, and the warning sign you missed.",
          "Finding: a process you dropped after six months, and why it did not stick.",
          "Framework: the checklist you wrote after the same mistake happened twice.",
          "Receipt: a hire, tool or campaign that cost more than it returned, and by how much.",
          "Finding: advice you followed that turned out wrong for a business your size.",
          "Framework: how you now handle the client situation that went badly last year.",
          "Finding: something you over-built, and what the simple version would have been.",
        ],
      },
      { type: "h2", text: "Ideas from decisions" },
      {
        type: "list",
        items: [
          "Finding: a service you stopped offering, and what happened to revenue after.",
          "Receipt: a price change, with the before and after, and how clients reacted.",
          "Framework: how you decide which projects to say no to.",
          "Finding: why you chose to stay small, or to grow, and what it has cost so far.",
          "Framework: the three questions you ask before any purchase over a set amount.",
          "Receipt: what moving from hourly to fixed pricing did to your margins.",
          "Finding: a decision you delayed for a year, and what finally made it.",
        ],
      },
      { type: "h2", text: "Ideas from tools" },
      {
        type: "list",
        items: [
          "Framework: the setup of one tool you use daily, step by step, for someone starting out.",
          "Receipt: time saved per week after switching one tool, measured before and after.",
          "Finding: a tool everyone recommends that did not fit, and the one that did.",
          "Framework: how you organise a client's files on day one.",
          "Finding: the feature of a common tool almost nobody in your field uses.",
          "Receipt: what your software stack costs a month, line by line.",
          "Framework: the template you use for a recurring document, and why each section is there.",
        ],
      },
      { type: "h2", text: "Ideas from hiring and working with people" },
      {
        type: "list",
        items: [
          "Framework: how you run a trial project before hiring a freelancer.",
          "Finding: what the best hire you made had in common with the best client you have.",
          "Receipt: how many applications a role got, and how many were a fit.",
          "Framework: the first week plan for a new team member.",
          "Finding: a job description line that changed who applied.",
          "Framework: how you hand over a client when someone leaves.",
          "Finding: what you do differently after working with a contractor in another timezone.",
        ],
      },
      { type: "h2", text: "Ideas from what you read" },
      {
        type: "p",
        text: "These are data posts. Each needs a named source: the organisation, the document and the year. If you cannot find the source again, skip the idea.",
      },
      {
        type: "list",
        items: [
          "Data: a change in a tax threshold or regulation your clients have to act on, with the official page.",
          "Data: a figure from a government statistics release about your industry, and what it means for a small firm.",
          "Data: a finding from an annual industry report, and whether your own numbers agree.",
          "Data: a public company's reported result that says something about your market.",
          "Data: a published price change from a supplier or platform your clients use.",
          "Data: a number from a public dataset your clients have never looked at.",
        ],
      },
      { type: "h2", text: "How to turn an idea into a post" },
      {
        type: "steps",
        items: [
          "Write the idea as one sentence with the specific in it: the number, the client type, the tool's name.",
          "Decide its kind. A framework needs steps, a receipt needs your number, a data post needs a source, a finding needs what you expected.",
          "Collect the missing fact before drafting. If it will take more than a day to find, move to the next idea.",
          "Draft with the most specific line first.",
          "Read it on your phone and cut anything that would fit in anyone else's post.",
        ],
      },
      { type: "h2", text: "How many ideas you need" },
      {
        type: "p",
        text: "At three posts a week you need about thirteen a month. Aim to keep twice that in your list, because some ideas will turn out thinner than they looked and some will need a number you cannot get yet. Spread them across a few themes, so a month of posts does not all come from one corner of your work.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes ideas across your four themes, each with its kind decided up front, and writes more when the queue drops under three days of scheduled posts. You can also type your own idea in a sentence or two, pick its theme, and it goes to the top of the Idea column. If you connect Stripe, GitHub, PostHog, Plausible or Notion with a read-only key, receipt ideas can start from your own figures.",
      },
    ],
    related: [
      "/blog/linkedin-post-templates",
      "/blog/content-themes-for-linkedin",
      "/blog/receipts-beat-opinions",
      "/blog/linkedin-content-calendar",
    ],
  },
  {
    slug: "linkedin-content-calendar",
    title: "How to plan a LinkedIn content calendar for a month",
    description:
      "Plan a month of LinkedIn posts with four themes, a job for each weekday, one batching session a week and two weeks of posts ready ahead.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "A LinkedIn content calendar is a plan that says which kind of post goes out on which day, and what it is about. To build one for a month, pick four themes, give each posting day a job, write the posts in one weekly session, and keep two weeks of finished posts ahead of today. The rest of this guide goes through each step and what to do when the plan meets real life.",
      },
      {
        type: "p",
        text: "The point of a calendar is to remove the Monday morning decision. When you know Tuesday is a receipt about pricing, you spend the time finding the number instead of staring at a blank draft.",
      },
      { type: "h2", text: "Start with four themes" },
      {
        type: "p",
        text: "Themes are the subjects you are allowed to post about. Four is enough to keep a feed varied and few enough that a reader can say what you are known for. A fractional finance lead might pick cash forecasting, first funding rounds, pricing and its effect on cash, and finance tools for founders. Write each as one line and keep the list where you plan.",
      },
      { type: "h2", text: "Give each weekday a job" },
      {
        type: "p",
        text: "A slot is a day plus a kind of post. Kinds give each day a shape before you know the topic. Here is a five day pattern for someone posting every weekday:",
      },
      {
        type: "list",
        items: [
          "Monday: framework. A method with named steps, from something you have done more than once.",
          "Tuesday: receipt. One number from your own business and what caused it.",
          "Wednesday: data. One public figure, named source, what it means for your reader.",
          "Thursday: framework or receipt, whichever you have material for.",
          "Friday: finding. Something you found out this week that surprised you.",
        ],
      },
      {
        type: "p",
        text: "If you post three times a week, keep Monday, Wednesday and Friday and rotate the kinds between weeks. Fewer slots you keep beats more slots you skip.",
      },
      { type: "h2", text: "What a month looks like on paper" },
      {
        type: "p",
        text: "Put the themes down the side and the weeks across the top, then rotate so no theme takes two slots in a row. For a three post week and four themes, a month reads like this:",
      },
      {
        type: "list",
        items: [
          "Week 1: Monday, framework on cash forecasting. Wednesday, data on funding rounds. Friday, finding on pricing.",
          "Week 2: Monday, receipt on finance tools. Wednesday, framework on pricing. Friday, finding on cash forecasting.",
          "Week 3: Monday, framework on funding rounds. Wednesday, receipt on cash forecasting. Friday, data on finance tools.",
          "Week 4: Monday, receipt on pricing. Wednesday, framework on finance tools. Friday, finding on funding rounds.",
        ],
      },
      {
        type: "p",
        text: "Each theme gets three posts a month, each in a different shape. That is the whole calendar. A spreadsheet with four rows and twelve cells does the job; a dedicated tool is optional.",
      },
      { type: "h2", text: "Batch the writing once a week" },
      {
        type: "steps",
        items: [
          "Block the same 90 minutes every week. Friday afternoon works for many people, because the week's material is still fresh.",
          "Read your running note of ideas from the week and match each one to an open slot.",
          "Collect any number or source a post needs before you start writing it.",
          "Draft all the week's posts in one sitting.",
          "Read them again the next morning, cut the weakest lines, and schedule them.",
        ],
      },
      {
        type: "p",
        text: "Writing in a batch is faster than writing daily, because you only have to get into the right frame of mind once. It also means a busy Tuesday does not cost you Tuesday's post.",
      },
      { type: "h2", text: "How far ahead to plan" },
      {
        type: "p",
        text: "Keep two weeks of finished posts scheduled ahead of today, and a rough plan for the two weeks after that. Two weeks absorbs a sick week or a client deadline without a gap in the feed. Planning further than a month in detail tends to go stale, because the best material comes from what happens during the month.",
      },
      {
        type: "list",
        items: [
          "Under three days of posts ready: write today, before anything else slips.",
          "Two weeks ready: the normal state. Batch once a week to stay there.",
          "More than four weeks ready: fine, but read the oldest posts again before they go out. Some will have aged.",
        ],
      },
      { type: "h2", text: "What to do when news breaks" },
      {
        type: "p",
        text: "A calendar is a default. When something big happens in your industry, or in the world, look at what is scheduled for the next few days.",
      },
      {
        type: "steps",
        items: [
          "Read the next three scheduled posts as if you were a stranger reading them today. If any would sound careless next to the news, pull it and move it to a later week.",
          "If the news touches one of your themes and you have something specific to add, write it and put it in the next slot. The planned post moves back a day.",
          "If you have nothing specific to add, do not post about it. A general reaction adds nothing to a feed full of them.",
          "Once the week is over, go back to the plan.",
        ],
      },
      { type: "h2", text: "Check the month against what you posted before" },
      {
        type: "p",
        text: "Before you fill a new month, look at what you posted in the last few. If one theme has had twice the posts of the others, or you keep returning to the same example, balance it in the new plan. LinkedIn does not let apps read your post history, but you can download it yourself: Settings, Data privacy, Get a copy of your data. Your posts are in a file called Shares.csv, with the date and the text of each one.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials has a calendar view of the board. Set a cadence from one to seven posts a week, and every post goes out at 09:00 in your timezone, one per day per profile. Drag a ready card onto a day to schedule it, or drag a scheduled post back to the rail to take it out of the queue when news changes the week. When fewer than three days of posts are scheduled, the board warns you and the agent writes more ideas.",
      },
      {
        type: "p",
        text: "If you import your Shares.csv, your past posts appear on the same calendar as background, so you can see what you covered before GoodSocials without any of it being posted again.",
      },
    ],
    related: [
      "/blog/content-themes-for-linkedin",
      "/blog/how-often-to-post-on-linkedin",
      "/blog/how-to-schedule-linkedin-posts",
      "/blog/download-your-linkedin-posts",
    ],
  },
  {
    slug: "linkedin-carousel-posts",
    title: "LinkedIn carousel posts: how to make a PDF people swipe",
    description:
      "LinkedIn carousels are PDF documents readers swipe page by page. How to plan the slides, keep type readable on a phone, and know when text is better.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "A LinkedIn carousel is a PDF you upload as a document post, which readers swipe through one page at a time in the feed. To make one, plan one idea per page, set type large enough to read on a phone, make the first page work as a headline, and export it as a PDF. The format suits content with a sequence. For most other posts, plain text is faster to make and reads as well.",
      },
      {
        type: "p",
        text: "The name causes some confusion. LinkedIn has had other swipeable formats over the years, but the one most people mean by a carousel today is the document post: you attach a PDF, give it a title, and LinkedIn shows the pages in a swipeable frame.",
      },
      { type: "h2", text: "How to post a carousel on LinkedIn" },
      {
        type: "steps",
        items: [
          "Design the pages in whatever tool you already use: slides software, a design tool, even a word processor.",
          "Export as a PDF. Check it on your phone before uploading, since that is where many people will see it.",
          "In LinkedIn, start a post and choose the option to add a document.",
          "Upload the PDF and give it a title. Readers see the title, so write it for them, not as a file name.",
          "Write the post text above it. The text still matters: it is what people read before deciding to swipe.",
        ],
      },
      {
        type: "p",
        text: "LinkedIn's help pages list the current file size and page limits for documents. Check them if you are planning a long deck, though a carousel that tests those limits is usually too long anyway.",
      },
      { type: "h2", text: "When a carousel beats a text post" },
      {
        type: "list",
        items: [
          "The content is a sequence the reader should follow in order: steps in a process, stages of a project.",
          "Each part needs a picture: a landing page teardown one section per page, a before and after of a design.",
          "It is a reference people will want to keep, like a checklist they save and come back to.",
          "There is a chart or diagram that needs its own page to be readable.",
        ],
      },
      { type: "h2", text: "When text is better" },
      {
        type: "list",
        items: [
          "The idea fits in a few short paragraphs. Splitting it across ten pages only adds swipes.",
          "The post is a receipt: one number and what caused it. A sentence carries it better than a slide.",
          "The post is an opinion or a finding that relies on tone. Text reads as a person talking; slides read as a presentation.",
          "You post several times a week. A carousel takes far longer to make than a text post, and a cadence built on carousels rarely lasts.",
        ],
      },
      { type: "h2", text: "How to plan the slides" },
      {
        type: "p",
        text: "Write the carousel as text first. If you cannot write it as a list of short lines, it will not work as pages either.",
      },
      {
        type: "steps",
        items: [
          "Write the whole thing as a numbered list, one line per point.",
          "Cut the list to the points that each need their own page. Most carousels are better at six to ten pages than at twenty.",
          "Turn the first line into a cover page that says what the reader gets. 'Five checks before a first VAT return' tells them; 'Tax tips' does not.",
          "Give every middle page one idea: a headline of a few words, and at most two short lines under it.",
          "End with a page that sums up the list, so someone who saves it has the whole thing on one page.",
        ],
      },
      { type: "h2", text: "One idea per slide" },
      {
        type: "p",
        text: "The most common carousel mistake is a page with a paragraph on it. People swipe fast. A page that needs more than a few seconds to read gets skipped, and a skipped page breaks the sequence. If a point needs a paragraph, it belongs in the post text, not on a slide.",
      },
      {
        type: "p",
        text: "A useful test: cover the body text on each page and read only the headlines in order. If the headlines alone make sense as a list, the carousel works. If they only make sense with the body text, rewrite the headlines.",
      },
      { type: "h2", text: "Readable type on a phone" },
      {
        type: "p",
        text: "Many people will see your carousel on a phone, in a frame narrower than the screen. Design for that, not for the large monitor you are working on.",
      },
      {
        type: "list",
        items: [
          "Use a square or portrait page. A wide page shrinks to a thin strip in the feed.",
          "Set headlines much larger than you think you need, and body text no smaller than you would read comfortably on a phone at arm's length.",
          "Use high contrast: dark text on a light background, or the reverse. Avoid text over photos.",
          "Keep a wide margin on every side. Edges are where text gets cropped or crowded.",
          "Use one typeface, two sizes and one accent colour, and keep them the same on every page.",
          "Export a test PDF and swipe through it on your own phone before you post it.",
        ],
      },
      { type: "h2", text: "The cover page" },
      {
        type: "p",
        text: "The first page does the job of the first line of a text post: it decides whether anyone swipes. Say what the carousel contains and who it is for, in as few words as possible. A number helps when it is honest: 'Six steps' tells the reader how long this will take. Avoid covers that only tease. If the reader cannot tell from the cover what they will get, most of them will not find out.",
      },
      { type: "h2", text: "Write the post text too" },
      {
        type: "p",
        text: "The words above the carousel are what people read before they decide to swipe. Give the post text its own opening line, say what the carousel covers, and add one detail that is not on the slides, such as where the method came from. Do not repeat every slide in the text.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials publishes text posts and text posts with a single image. It does not publish documents or carousels. If a post is better as a carousel, the text GoodSocials drafts makes a good outline for the pages, but you design and upload the PDF yourself.",
      },
      {
        type: "p",
        text: `For the posts it does publish, GoodSocials can generate one image per post, up to ${IMAGE_CAP_PER_MONTH} a month per profile. How those images look is set by your visual principle, and a revise comment on any image updates it for the next ones.`,
      },
    ],
    related: [
      "/blog/picking-a-format-text-image-carousel-video",
      "/blog/how-to-format-linkedin-posts",
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/repurpose-blog-post-into-linkedin-posts",
    ],
  },
  {
    slug: "repurpose-blog-post-into-linkedin-posts",
    title: "How to repurpose a blog post into LinkedIn posts",
    description:
      "Turn one blog post into four or five LinkedIn posts that each stand alone: pull the number, the framework, the mistake and the quote, then place the link.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "To repurpose a blog post for LinkedIn, pull four or five separate pieces out of it, the number, the framework, the mistake, the quote, and write each as its own post that makes sense without the article. The link to the original is optional and goes at the end, or in a comment. Many readers will never click it, so every post has to give them the value in the feed.",
      },
      {
        type: "p",
        text: "What this rules out is the summary post: 'New on the blog: five lessons from our pricing change. Read it here.' That post asks the reader to leave LinkedIn before giving them anything, and most of them will not.",
      },
      { type: "h2", text: "Why one article makes several posts" },
      {
        type: "p",
        text: "A good article has more than one idea in it. It has a main argument, the evidence for it, a method, a story of something that went wrong, and a few lines worth quoting. On a blog those sit together because the reader chose to read the whole thing. In a feed, each reader gives you a few seconds, so each post can carry one of those pieces, and one strong article becomes a week of posts.",
      },
      { type: "h2", text: "What to pull out" },
      {
        type: "p",
        text: "Read the article with a highlighter and mark these five things. Not every article has all five. Three is enough.",
      },
      {
        type: "list",
        items: [
          "The number. The most specific figure in the article: a before and after, a count, a cost. This becomes a receipt post.",
          "The framework. Any method with steps or parts. This becomes a framework post, with the steps written out in full.",
          "The mistake. Whatever went wrong on the way to the conclusion. This becomes a finding: what you expected, what happened, what changed.",
          "The quote. One sentence from the article, yours or a client's, that says the whole idea in a line. This becomes a short post built around it.",
          "The argument. The article's main point, stated plainly. This is usually the weakest post alone, so save it for last and support it with the evidence.",
        ],
      },
      { type: "h2", text: "An example" },
      {
        type: "p",
        text: "Say Northside Studio, a two-person web design studio, published an article about moving from hourly billing to fixed packages. Here is how it breaks down:",
      },
      {
        type: "list",
        items: [
          "Receipt: proposals used to take three days and now take one, because a fixed menu of packages turned each proposal into a choice.",
          "Framework: the four questions the studio uses to decide which package a client needs.",
          "Finding: the studio expected clients to push back on fixed prices. Most asked fewer questions about price, not more.",
          "Quote: a client's line from the article, 'I knew what I was paying before the first call,' with two sentences on why that matters.",
          "Argument: fixed packages suit small studios better than hourly billing, with the three reasons from the article.",
        ],
      },
      {
        type: "p",
        text: "Five posts, each readable by someone who never sees the article. Spread over two weeks, with other posts between them, they do not read as a series.",
      },
      { type: "h2", text: "Each post must stand without the link" },
      {
        type: "p",
        text: "This is the rule that decides whether repurposing works. Read each draft and ask: if the link disappeared, would the reader still learn something? If the answer is no, the post is an advert for the article.",
      },
      {
        type: "steps",
        items: [
          "Write each post from scratch, using the article as notes. Copying paragraphs across rarely works, because blog paragraphs lean on what came before them.",
          "Give each post its own opening line with the specific detail first.",
          "Include the whole of the piece you pulled. If it is a framework, list every step. Holding back a step to push a click feels like a trick to the reader.",
          "Cut every reference to the article from the body. 'As I wrote last week' makes the post depend on something the reader has not seen.",
          "Read it on a phone, as someone who follows you but has never visited your blog.",
        ],
      },
      { type: "h2", text: "Where the link goes" },
      {
        type: "p",
        text: "LinkedIn does not publish how its feed treats links, and claims about it are guesses. You have three options, each with a cost.",
      },
      {
        type: "list",
        items: [
          "At the end of the post, as a plain line: 'The full write-up, with the numbers per client, is on the Northside blog.' Clear, and readers who want more can find it.",
          "In the first comment. Keeps the post clean, but many readers never open comments and it can look like a workaround.",
          "Nowhere. The post stands alone and the article is there for anyone who looks at your profile or website.",
        ],
      },
      {
        type: "p",
        text: "A reasonable mix is a link on one of the five posts, the one where the article adds the most, and none on the rest. Whatever you choose, tell the reader what they get by clicking as well as where the link is.",
      },
      { type: "h2", text: "How to space them" },
      {
        type: "list",
        items: [
          "Do not post them on consecutive days. Put other posts between them so the feed does not become one topic.",
          "Lead with the strongest piece, usually the number or the framework.",
          "Leave the argument post for last, when readers have already seen the evidence in earlier posts.",
          "If one post does well, write a follow up on that piece rather than reposting the article.",
        ],
      },
      { type: "h2", text: "Going the other way" },
      {
        type: "p",
        text: "The same idea works in reverse. A run of LinkedIn posts on one theme is often the outline of a blog post you have not written yet. When three or four posts on the same subject have landed, collect them, fill the gaps, and you have an article.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "On the GoodSocials board you can add your own idea in a sentence or two and pick which of your four themes it belongs to. Add each piece you pulled from the article as a separate idea, with the number or the steps written into it, and each becomes its own card. When approved, the agent drafts it in your voice principle, and the quality check reads it for invented numbers and claims with nothing behind them before it can be scheduled.",
      },
    ],
    related: [
      "/blog/links-in-linkedin-posts",
      "/blog/linkedin-post-ideas",
      "/blog/receipts-beat-opinions",
      "/blog/how-to-write-a-linkedin-post",
    ],
  },
];
