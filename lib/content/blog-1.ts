import type { BlogPost, Reference } from "./types";

const DWELL_2020: Reference = {
  title:
    "Dangi, S., Jia, J., Somaiya, M. and Xuan, Y. (2020). Understanding dwell time to improve LinkedIn feed ranking. LinkedIn Engineering Blog.",
  url: "https://www.linkedin.com/blog/engineering/feed/understanding-feed-dwell-time",
};

const DWELL_2024: Reference = {
  title:
    "Zhang, F. (2024). Leveraging dwell time to improve member experiences on the LinkedIn feed. LinkedIn Engineering Blog.",
  url: "https://www.linkedin.com/blog/engineering/feed/leveraging-dwell-time-to-improve-member-experiences-on-the-linkedin-feed",
};

const NIELSEN_1997: Reference = {
  title: "Nielsen, J. (1997). How users read on the web. Nielsen Norman Group.",
  url: "https://www.nngroup.com/articles/how-users-read-on-the-web/",
};

export const POSTS_1: BlogPost[] = [
  {
    slug: "how-often-to-post-on-linkedin",
    title: "How often to post on LinkedIn in 2026",
    description:
      "LinkedIn publishes no ideal posting frequency, so the useful question is which cadence holds for a year, and research on habits and planning bears on that.",
    date: "2026-09-24",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "LinkedIn does not publish its feed ranking model. Its engineering blog describes parts of it. One post explains that the feed measures dwell time from the moment at least half of an update is visible [1]. A model then predicts the probability that a member skips an update [1]. The published material reviewed here does not name a best number of posts per week. Any exact posting frequency found online is a practice, and should be read as one.",
      },
      {
        type: "p",
        text: "A more answerable question is which cadence a person can hold for twelve months. The evidence below bears on that question.",
      },
      { type: "h2", text: "Repetition and familiarity" },
      {
        type: "p",
        text: "Zajonc proposed in 1968 that mere repeated exposure to a stimulus improves attitudes toward it [2]. His evidence came from word frequency data and from laboratory exposure to nonsense words and symbols. A name that appears in a feed each week is a similar kind of stimulus. Whether the effect transfers to LinkedIn authors has not been tested in public data. It remains a plausible hypothesis, and one reason to favour regular posts over rare bursts.",
      },
      {
        type: "p",
        text: "A second point is observable. A client, investor or candidate who opens a profile sees the latest activity. A steady run of posts signals current work. A last post from April signals less, fairly or not.",
      },
      {
        type: "h2",
        text: "Habits form through repetition in a stable context",
      },
      {
        type: "p",
        text: "Lally and colleagues followed 96 volunteers who repeated one daily behaviour in the same context for 12 weeks [3]. The time to reach 95 percent of the modelled plateau of automaticity ranged from 18 to 254 days. More consistent performance was associated with a better fit of the habit curve. The behaviours were eating, drinking and physical activity. Writing posts is a different behaviour, so the numbers transfer loosely at best. The shape of the finding still applies: automaticity builds with repetition in a stable context, and it can take months.",
      },
      {
        type: "p",
        text: "Repetition also trains the writing. Three posts a week for a year is more than 150 attempts at saying one thing plainly in a small space.",
      },
      { type: "h2", text: "A cadence chosen for the busiest month" },
      {
        type: "p",
        text: "Buehler, Griffin and Ross found that people underestimate how long their own tasks will take [4]. Participants focused on future plans and set aside relevant past experience. In one of their studies, the optimistic bias disappeared when participants were told to connect past experiences to the prediction. Applied to posting, a cadence chosen on a calm day will tend to be too high. A better anchor is the busiest month of the past year: the launch, the client deadline, the school holidays.",
      },
      {
        type: "list",
        items: [
          "Once a week is a common floor. This is a practice, and no public data fixes the number.",
          "Three times a week suits many founders and consultants with a clear topic. It leaves room for the rest of the job.",
          "Every weekday is workable when the writing happens in batches ahead of time and a queue handles publishing.",
        ],
      },
      { type: "h2", text: "Batch the writing, fix the time" },
      {
        type: "p",
        text: "Gollwitzer reviewed research on implementation intentions [5]. These are plans that link an anticipated situation to a specific response, in an if-then form. The research program found that such plans further the attainment of goals. A weekly writing block at a fixed time is an implementation intention for posting.",
      },
      {
        type: "steps",
        items: [
          "A 90 minute block sits at the same time each week. Friday afternoon suits many people, since the week is fresh in memory.",
          "Every idea from the week goes on a list: client questions, numbers seen, arguments had, mistakes fixed.",
          "The best ideas fill next week's slots and are drafted in the same session.",
          "A second read the next morning cuts sentences that carry no point.",
          "Each post is scheduled at one fixed time of day, so publishing stops being a daily decision.",
        ],
      },
      { type: "h2", text: "After a missed day" },
      {
        type: "p",
        text: "In the Lally study, missing one opportunity to perform the behaviour did not materially affect habit formation [3]. That supports a calm response to a missed day. Posting twice the next day to catch up adds little. Two posts a few hours apart compete for the same readers, and the second often reads as filler. That last point is a practice with no published data behind it. The normal rhythm resumes and the gap closes. Three missed weeks is a different matter. That is a restart.",
      },
      { type: "h2", text: "Signs a cadence is too high" },
      {
        type: "list",
        items: [
          "Posts get shorter and vaguer, with fewer specifics each week.",
          "The easiest post to write wins over the post worth reading.",
          "The same idea returns in slightly different words.",
          "Mornings without a draft bring dread.",
        ],
      },
      {
        type: "p",
        text: "Any of these is a reason to drop one slot a week. A lower rhythm that holds is worth more than a higher one that stops.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials is built around cadence. The board keeps a queue of approved posts. The calendar allows one post per day per profile, published at 09:00 in the board's timezone. The dashboard leads with posts published this month and the current streak. It shows no impressions or follower counts, because cadence is the part an author controls.",
      },
    ],
    references: [
      DWELL_2020,
      {
        title:
          "Zajonc, R. B. (1968). Attitudinal effects of mere exposure. Journal of Personality and Social Psychology, 9(2, Pt. 2), 1-27.",
        url: "https://doi.org/10.1037/h0025848",
      },
      {
        title:
          "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W. and Wardle, J. (2010). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998-1009.",
        url: "https://doi.org/10.1002/ejsp.674",
      },
      {
        title:
          "Buehler, R., Griffin, D. and Ross, M. (1994). Exploring the planning fallacy: why people underestimate their task completion times. Journal of Personality and Social Psychology, 67(3), 366-381.",
        url: "https://doi.org/10.1037/0022-3514.67.3.366",
      },
      {
        title:
          "Gollwitzer, P. M. (1999). Implementation intentions: strong effects of simple plans. American Psychologist, 54(7), 493-503.",
        url: "https://doi.org/10.1037/0003-066X.54.7.493",
      },
    ],
  },
  {
    slug: "first-two-lines-of-a-linkedin-post",
    title: "Why the first two lines of a LinkedIn post carry the most weight",
    description:
      "Readers scan, eye tracking shows the first lines get the most attention, and LinkedIn's feed measures whether people stop, so the opening does most of the work.",
    date: "2026-09-18",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "A LinkedIn post can run to 3,000 characters [1]. In the feed, a long post shows its opening lines and folds the rest behind a see more link. The exact cut depends on the screen and the app. A reader who scrolls past sees only those opening lines.",
      },
      {
        type: "p",
        text: "LinkedIn engineers have described how the feed measures this moment. Dwell time on the feed starts when at least half of an update is visible [2]. Updates viewed only briefly are treated as skipped, and a model predicts the probability of a skip [2]. The full ranking model is not public. What is public shows that the feed pays attention to whether people stop.",
      },
      { type: "h2", text: "How people read on screens" },
      {
        type: "p",
        text: "Nielsen reported in 1997 that 79 percent of test users scanned every new page they came across, and 16 percent read word by word [3]. The participants were reading websites in usability tests. A LinkedIn feed is a different setting, so the figures are indicative only.",
      },
      {
        type: "p",
        text: "Later eye tracking work at Nielsen Norman Group described the F-shaped pattern [4]. First lines of text receive more gazes than later lines. The first words on the left of a line receive more fixations than later words. The journalism convention of the inverted pyramid fits these findings. The most important information comes first, so a reader who stops after one sentence still knows the subject [5].",
      },
      { type: "h2", text: "What the opening has to do" },
      {
        type: "p",
        text: "The first two lines say what the post is about and give a reason to care. Plain, specific sentences serve that purpose. Clever or mysterious ones delay it.",
      },
      {
        type: "list",
        items: [
          "The subject in concrete terms: a client, a number, a decision, a tool.",
          "The audience. A reader knows within a line whether this is their problem.",
          "A promise the body keeps. An opening that sets up a lesson needs a lesson below it.",
        ],
      },
      { type: "h2", text: "Openings that work" },
      {
        type: "p",
        text: "Each example below names something specific and leaves a clear question for the body to answer. The figures in them are placeholders for the author's own.",
      },
      {
        type: "list",
        items: [
          "A client cut onboarding from nine steps to four. Support tickets in the first week dropped by half.",
          "Three questions a small agency should ask before signing a retainer, learned from the ones that went wrong.",
          "The pricing page changed on a Tuesday. By Friday the sales calls were about different things.",
          "Most bookkeeping errors in a first year come from the same two habits. Both are easy to fix.",
          "A founder asked why demo calls kept stalling. The answer was on slide two.",
        ],
      },
      {
        type: "p",
        text: "Loewenstein describes curiosity as a response to a perceived gap in knowledge or understanding [6]. Each of these openings creates a small, specific gap. The reader knows what the answer will be about before reading it.",
      },
      { type: "h2", text: "Openings that lose readers" },
      {
        type: "list",
        items: [
          "The vague claim, such as 'Leadership is hard.' Few readers would disagree, so the line gives little reason to click.",
          "The fake cliffhanger: a promise of a shocking outcome with no subject attached.",
          "Throat clearing, such as 'I have been thinking a lot lately about...' Two lines in, the subject is still missing.",
          "A one word line followed by white space. It signals a template.",
          "A question with an obvious answer, such as whether the reader wants more clients.",
        ],
      },
      { type: "h2", text: "Write the opening last" },
      {
        type: "p",
        text: "The strongest opening often sits in the fourth paragraph of a draft. A reasonable practice is to write the body first, then move its most specific sentence to the top.",
      },
      {
        type: "steps",
        items: [
          "The whole post is drafted without attention to the start.",
          "The most specific sentence is marked: a number, a name, a before and after.",
          "That sentence becomes the first line.",
          "The second line says why it matters or what the reader will learn.",
          "Whatever sat above it is deleted. It was warm up.",
        ],
      },
      { type: "h2", text: "Check the fold on a narrow screen" },
      {
        type: "p",
        text: "A draft can be checked in a narrow column before it goes out. If the fold cuts a sentence in half, the opening needs work. The same holds if the visible part is greetings and context. A line break after the first sentence gives the eye a clear place to land. This is a practice, consistent with the finding that first lines draw the most gazes [4].",
      },
      { type: "h2", text: "The body has to keep the promise" },
      {
        type: "p",
        text: "In 2024 LinkedIn described a model of long dwell, where a member spends significant time engaging with a post [7]. The team noted that a skip model alone captures only negative preferences [7]. A strong opening followed by a thin post earns the stop and then loses the reader. If the first line mentions a number, the post explains where it came from. If it promises three questions, three questions follow.",
      },
      {
        type: "p",
        text: "A quick test: a colleague reads only the first two lines and predicts the rest. A matching prediction means the opening is honest. A wrong one means the opening or the body has to change.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials drafts every post with the specific detail first. A member who dislikes an opening says so in a revise comment. The comment rewrites that card and updates the format principle, so later cards open the way the member asked. The quality gate also holds empty posts with no point to make, and shows the reason on the card.",
      },
    ],
    references: [
      {
        title: "LinkedIn Help (2026). Post and share updates.",
        url: "https://www.linkedin.com/help/linkedin/answer/a528176",
      },
      DWELL_2020,
      NIELSEN_1997,
      {
        title:
          "Pernice, K. (2017). F-shaped pattern of reading on the web: misunderstood, but still relevant (even on mobile). Nielsen Norman Group.",
        url: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/",
      },
      {
        title:
          "Schade, A. (2018). Inverted pyramid: writing for comprehension. Nielsen Norman Group.",
        url: "https://www.nngroup.com/articles/inverted-pyramid/",
      },
      {
        title:
          "Loewenstein, G. (1994). The psychology of curiosity: a review and reinterpretation. Psychological Bulletin, 116(1), 75-98.",
        url: "https://doi.org/10.1037/0033-2909.116.1.75",
      },
      DWELL_2024,
    ],
  },
  {
    slug: "receipts-beat-opinions",
    title: "Receipt posts: why a number the author owns persuades",
    description:
      "Research on source credibility suggests a result only the author could report carries more weight than an opinion many people could post, provided the number is true.",
    date: "2026-09-12",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Much of a professional feed is opinion. Remote work, hiring, AI, pricing, leadership. Many of these posts could come from any of a thousand authors. A reader then has little reason to remember the one who wrote it.",
      },
      {
        type: "p",
        text: "A receipt is a post built around a number or result that belongs to the author: something measured, shipped, sold or lost. Other authors cannot write it.",
      },
      { type: "h2", text: "What counts as a receipt" },
      {
        type: "list",
        items: [
          "A before and after from the author's own work. Churn in March against churn in June, and what changed between them.",
          "A count. How many sales calls it took to close the first ten customers.",
          "A cost. What a failed campaign spent before it stopped, and what it taught.",
          "A time. How long onboarding took before and after a redesign.",
          "A small, specific win. The first invoice paid by a customer who found the company through a post.",
        ],
      },
      {
        type: "p",
        text: "The number need not be large. Small numbers from real work let readers picture being in the same place.",
      },
      { type: "h2", text: "What the research on credibility says" },
      {
        type: "p",
        text: "Pornpitakpan reviewed five decades of studies on source credibility and persuasion [1]. Main effect studies mostly found a high credibility source more persuasive than a low credibility one. Interaction studies found conditions where high credibility was a liability. Credibility helps on average, with exceptions.",
      },
      {
        type: "p",
        text: "Hovland and Weiss found that people discounted material from sources they saw as untrustworthy at the time of exposure [2]. Over time the scepticism faded, as people separated the content from its source. A feed post is judged at the moment of exposure, as it scrolls past. In their data, that is when the source mattered most.",
      },
      {
        type: "p",
        text: "A receipt carries its source inside the post. The author was there and reports what happened. No study has tested receipt posts on LinkedIn directly. This section applies the general findings, and the fit is a hypothesis.",
      },
      {
        type: "p",
        text: "Web usability research points the same way. In Nielsen's 1997 tests, a site rewritten to be concise, scannable and objective scored 124 percent higher on measured usability than a promotional version [3]. The study measured websites. It suggests plain facts serve readers better than promotional claims.",
      },
      { type: "h2", text: "Turning an opinion into a receipt" },
      {
        type: "p",
        text: "Most opinion posts have a receipt behind them. The opinion came from somewhere, and the experience behind it is the better lead.",
      },
      {
        type: "steps",
        items: [
          "The opinion is written in one sentence. For example: annual plans are underrated for small software companies.",
          "The origin of the opinion is named. Perhaps a client added an annual option last year.",
          "The number is found. The share of new customers who picked annual in the first quarter, and the effect on cash.",
          "The post leads with the number and the situation. The opinion comes last, as the conclusion.",
          "Sentences that argue the point without evidence are cut. The receipt carries the argument.",
        ],
      },
      { type: "h2", text: "The number must be true" },
      {
        type: "p",
        text: "A receipt is worth something only if it is true. The LinkedIn Professional Community Policies ask members to share only information that is real and authentic [4]. They prohibit content that is false, misleading or intended to deceive [4]. The LinkedIn User Agreement bars using the service for misleading or deceitful purposes [5]. A guessed or borrowed figure turns a receipt into a claim. A reader who spots one invented figure has reason to doubt the rest.",
      },
      {
        type: "list",
        items: [
          "A missing number leaves a gap in the draft until the author supplies it.",
          "A range is acceptable when stated as one. 'Between 40 and 50 customers' is honest and still specific.",
          "A confidential client figure becomes a direction and a method, without the value.",
          "A number from someone else names its source.",
        ],
      },
      { type: "h2", text: "Where the numbers live" },
      {
        type: "p",
        text: "Most founders and consultants hold more receipts than they post. The numbers sit in tools they use every day.",
      },
      {
        type: "list",
        items: [
          "Billing: new customers, churned customers, revenue against the same month last year.",
          "Product analytics: which feature got used after launch, how many people finished onboarding.",
          "Website analytics: which page brought visitors, and from where.",
          "Code history: releases shipped this quarter, time taken to fix a bug.",
          "Calendar and inbox: calls held, proposals sent, and how many said yes.",
        ],
      },
      { type: "h2", text: "Balance receipts with the rest" },
      {
        type: "p",
        text: "A feed of numbers alone can read like a report. Frameworks, findings and plain explanations fill the other slots, often drawing on the same experience from another angle. One receipt a week is a reasonable practice. No public data sets the ratio.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials reads a member's own figures, read-only, from Stripe, GitHub, PostHog, Plausible and Notion with a pasted key. Receipts are one of its four post kinds. When a post needs a number only the author knows, the card asks for it and the draft leaves the gap. The quality gate holds any draft with an invented number or an unsupported claim before it can be scheduled.",
      },
    ],
    references: [
      {
        title:
          "Pornpitakpan, C. (2004). The persuasiveness of source credibility: a critical review of five decades' evidence. Journal of Applied Social Psychology, 34(2), 243-281.",
        url: "https://doi.org/10.1111/j.1559-1816.2004.tb02547.x",
      },
      {
        title:
          "Hovland, C. and Weiss, W. (1951). The influence of source credibility on communication effectiveness. Public Opinion Quarterly, 15(4), 635.",
        url: "https://doi.org/10.1086/266350",
      },
      NIELSEN_1997,
      {
        title: "LinkedIn (2026). Professional Community Policies.",
        url: "https://www.linkedin.com/legal/professional-community-policies",
      },
      {
        title: "LinkedIn (2025). User Agreement.",
        url: "https://www.linkedin.com/legal/user-agreement",
      },
    ],
  },
  {
    slug: "links-in-linkedin-posts",
    title: "Links in LinkedIn posts in 2026: what is known and what is not",
    description:
      "Link in the post, link in the first comment, or no link at all: what LinkedIn has published, what it has not, and the tradeoffs of each option.",
    date: "2026-09-06",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Advice about links on LinkedIn is confident and mostly unverifiable. LinkedIn does not publish its ranking rules. A common impression among frequent posters holds that posts with an external link reach fewer people. No LinkedIn document found for this article confirms or denies it. The impression may be right. It may also change without notice.",
      },
      {
        type: "p",
        text: "What LinkedIn engineers have published is narrower. The feed measures dwell time on the feed and dwell time after the click, which is time spent on content after clicking an update [1]. A 2024 post describes a model that predicts whether a member will spend more time on a post than a given share of comparable posts [2]. Neither post discusses external links. The decision therefore rests on tradeoffs that can be observed.",
      },
      { type: "h2", text: "Option one: the link in the post" },
      {
        type: "p",
        text: "The reader sees the link where the post mentions it. LinkedIn usually shows a preview card with a title and an image. That preview can come from a cache, and LinkedIn offers a Post Inspector tool to refresh an outdated one [3].",
      },
      {
        type: "list",
        items: [
          "Suits posts whose whole point is the link: a launch, a job opening, a signup page.",
          "Suits readers who want to click, since the link is in plain sight.",
          "Costs visual space, since the preview card takes a large part of the post.",
          "Can read like an advert, even when the text is useful.",
        ],
      },
      { type: "h2", text: "Option two: the link in the first comment" },
      {
        type: "p",
        text: "Many authors post the text alone and add the link as the first comment, with a line in the post saying where to find it.",
      },
      {
        type: "list",
        items: [
          "Suits posts where the text stands on its own and the link is extra reading.",
          "Adds a step for the reader.",
          "Depends on someone adding the comment right after publishing. A scheduled post needs a person to add it by hand.",
        ],
      },
      {
        type: "p",
        text: "Whether this avoids any reach penalty is itself unknown. It is an experiment, and it deserves to be run as one.",
      },
      { type: "h2", text: "Option three: no link" },
      {
        type: "p",
        text: "The useful part of the article goes into the post. A post that teaches three things states the three things. A reader who wants more can visit the profile. The Featured section of a LinkedIn profile can hold external links next to posts and articles [4].",
      },
      {
        type: "list",
        items: [
          "Suits most posts. The reader gets the value without leaving the feed.",
          "Fits the dwell signals described above, since a complete post gives a reader a reason to stay on it. This is a hypothesis. No published comparison of linked and unlinked posts was found.",
          "Costs direct clicks from any single post.",
        ],
      },
      { type: "h2", text: "Choosing for each post" },
      {
        type: "steps",
        items: [
          "The goal is named first. If the goal is a click, the link goes in the post and the text says plainly why.",
          "If the goal is teaching, the lesson is written in full. The link is left out, or added in a comment for readers who want the source.",
          "A source cited for a claim is named in the text. The name carries credibility even without the link.",
          "Linked posts stay a minority of the feed. A feed of links reads like a newsletter of other people's work.",
        ],
      },
      { type: "h2", text: "A test on one feed" },
      {
        type: "p",
        text: "Since the ranking rules are private, an author's own results are the best available evidence. Over two months, similar posts go out with and without links. A simple note records reach, comments and profile visits for each. One post is weak evidence. Several of each kind start to show a pattern. Even then, the result describes one audience at one time.",
      },
      {
        type: "list",
        items: [
          "Topic and format stay similar, so the link is the main difference.",
          "Posts go out at the same time of day, so timing does not confuse the result.",
          "Comments and profile visits count alongside reach. A post that reached fewer people and started three good conversations did its job.",
        ],
      },
      { type: "h2", text: "Tracking the clicks" },
      {
        type: "p",
        text: "When a post does link, UTM parameters let website analytics separate visits from LinkedIn from the rest. Google's documentation recommends utm_source, utm_medium and utm_campaign on every tagged URL [5]. A campaign name per month or per post type is enough. The resulting count of visits is a figure the author owns, and it can become a receipt post of its own.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials publishes approved posts on a schedule, one per day per profile. Where links go is a format choice. A member who wants links kept out of posts says so once in a revise comment. That comment updates the format principle, and every later card follows it.",
      },
    ],
    references: [
      DWELL_2020,
      DWELL_2024,
      {
        title: "LinkedIn Help (2026). Use Post Inspector to refresh URL.",
        url: "https://www.linkedin.com/help/linkedin/answer/a6233775",
      },
      {
        title: "LinkedIn Help (2026). Featured section on a profile: FAQs.",
        url: "https://www.linkedin.com/help/linkedin/answer/a552452",
      },
      {
        title:
          "Google Analytics Help (2026). URL builders: collect campaign data with custom URLs.",
        url: "https://support.google.com/analytics/answer/10917952",
      },
    ],
  },
  {
    slug: "picking-a-format-text-image-carousel-video",
    title: "Text, image, document or video: choosing a LinkedIn post format",
    description:
      "LinkedIn publishes no format weights, so the format follows from what the post needs to show, with research on illustrations and accessibility as a guide.",
    date: "2026-08-31",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Every few months a different format is said to be the one LinkedIn favours: text, then documents, then video. LinkedIn does not publish format weights for its ranking, and no public data settles the question. A steadier method starts from what the post needs to show. The format usually follows.",
      },
      { type: "h2", text: "Text only" },
      {
        type: "p",
        text: "A text post is the fastest to make and reads well on phones and desktops. It suits arguments, stories, short lessons and other content that works as a few clear paragraphs.",
      },
      {
        type: "list",
        items: [
          "Uses: a finding from client work, an answer to a common question, a short framework with three or four points.",
          "Risk: a wall of text. Line breaks every one or two sentences, and numbered points where the content is a list, make it easier to scan.",
          "Length: long enough to be useful, short enough to finish. A few hundred words covers most posts. This is a practice.",
        ],
      },
      { type: "h2", text: "Text with an image" },
      {
        type: "p",
        text: "Carney and Levin reviewed research on illustrations in text [2]. Carefully constructed illustrations generally improved learners' performance on outcomes that depend on the text. The studies concerned students and textbooks, and a feed differs from a textbook. The transferable part is the word carefully: an image helps when it carries information.",
      },
      {
        type: "list",
        items: [
          "Informative images: a chart of the number in the post, a screenshot of the thing discussed, a diagram of the framework, a real photo from the work.",
          "Weak images: stock photos of people pointing at laptops, quote cards that repeat the first line.",
          "Text on the image stays large and short, for small screens.",
          "Alt text lets members who use screen readers understand the image [3]. The W3C images tutorial asks that a text alternative convey the essential information the image presents [4].",
        ],
      },
      { type: "h2", text: "Documents and carousels" },
      {
        type: "p",
        text: "LinkedIn lets members upload a document to a post. Supported types are PPT, PPTX, DOC, DOCX and PDF, up to 100 MB and 300 pages [1]. Readers page through it in the feed, which is why these posts are often called carousels. They suit content with a sequence: steps, a before and after, a set of examples.",
      },
      {
        type: "list",
        items: [
          "Uses: a step by step process, a checklist, a teardown of a landing page one section at a time.",
          "One idea per page, with a large headline and little body text.",
          "The first page does the job of an opening line. It decides whether readers turn to the second.",
          "Cost: far more time than a text post. Worth it when the content needs the sequence.",
        ],
      },
      { type: "h2", text: "Video" },
      {
        type: "p",
        text: "Video carries face, voice and tone. It is also the most expensive format to make well, and the easiest to abandon after a few attempts.",
      },
      {
        type: "list",
        items: [
          "Uses: a short demo, a walkthrough of a result, an explanation from the person clients will work with.",
          "Captions. LinkedIn accepts an SRT caption file at upload [5]. Captions exist first for people who are deaf or hard of hearing [6]. They also help any viewer watching without sound.",
          "The point comes in the first seconds, for the same reason the first line of a text post matters.",
          "Regular video is a commitment. A single video is fine. A series that stops leaves a gap.",
        ],
      },
      { type: "h2", text: "A way to decide" },
      {
        type: "steps",
        items: [
          "The post is written as text first, whatever the final format.",
          "If a picture would make it clearer, an image is added. A number often wants a chart. A product often wants a screenshot.",
          "If the content has a sequence to follow page by page, a document fits.",
          "If seeing and hearing the author changes how the post lands, and time allows, video fits.",
          "If these do not apply, the post stays text. Plain text remains a complete format.",
        ],
      },
      { type: "h2", text: "A mix that fits the cadence" },
      {
        type: "p",
        text: "The format mix has to fit the posting rhythm. One two hour carousel in a three post week may be fine. A carousel every day will not last. For many founders a workable mix is mostly text and text with an image, with heavier formats saved for ideas that earn them. This is a practice, and no public data sets the ratio.",
      },
      {
        type: "p",
        text: "Visual consistency helps recognition. A small set of colours and one or two chart layouts, reused, make posts identifiable before the name is read. This is a design practice without LinkedIn specific evidence behind it.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes text posts and can generate an image for each one, up to 200 a month per profile. How those images look is the visual principle, one of three brand principles per profile. A revise comment on any image updates that principle, so the next images follow it.",
      },
    ],
    references: [
      {
        title: "LinkedIn Help (2026). Upload and share documents on LinkedIn.",
        url: "https://www.linkedin.com/help/linkedin/answer/a518909",
      },
      {
        title:
          "Carney, R. N. and Levin, J. R. (2002). Pictorial illustrations still improve students' learning from text. Educational Psychology Review, 14(1), 5-26.",
        url: "https://doi.org/10.1023/A:1013176309260",
      },
      {
        title:
          "LinkedIn Help (2026). Add alternative text to images for accessibility.",
        url: "https://www.linkedin.com/help/linkedin/answer/a519856/add-alternative-text-to-images-for-accessibility",
      },
      {
        title: "W3C Web Accessibility Initiative (2026). Images tutorial.",
        url: "https://www.w3.org/WAI/tutorials/images/",
      },
      {
        title:
          "LinkedIn Help (2026). Add closed captions to videos on LinkedIn.",
        url: "https://www.linkedin.com/help/linkedin/answer/a552177/add-closed-captions-to-videos-on-linkedin",
      },
      {
        title:
          "W3C (2023). Understanding success criterion 1.2.2: captions (prerecorded). WCAG 2.2.",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html",
      },
    ],
  },
];
