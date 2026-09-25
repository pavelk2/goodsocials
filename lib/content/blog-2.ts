import type { BlogPost } from "./types";

export const POSTS_2: BlogPost[] = [
  {
    slug: "best-time-to-post-on-linkedin",
    title: "The best time to post on LinkedIn is a time that can be kept",
    description:
      "LinkedIn publishes no ideal posting hour. The evidence on habits favours one fixed slot in the audience's morning, kept every week.",
    date: "2026-08-26",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Articles on the best time to post on LinkedIn each name a different hour. Tuesday at ten, Wednesday at eight, Thursday at noon. The charts come from different audiences, years and methods. They rarely come from a given author's own readers. LinkedIn does not publish its ranking model, so an outside chart cannot claim to know the answer.",
      },
      { type: "h2", text: "What LinkedIn has published about timing" },
      {
        type: "p",
        text: "LinkedIn's Help Center lists the signals its feed uses. Content signals include how often a post is viewed or engaged with, and how recent it is [1]. Members can also sort their feed with the most recent posts first [1]. Recency therefore counts. The Help Center gives no hour of the day and no weighting.",
      },
      {
        type: "p",
        text: "LinkedIn Engineering has described a model that predicts whether a member will skip a post. The ranking score of each update is lowered in proportion to that prediction [2]. A post that readers scroll past loses ground at any hour. This suggests the content of a post matters at least as much as its timing. No public data gives the size of either effect.",
      },
      { type: "h2", text: "Post in the audience's timezone" },
      {
        type: "p",
        text: "Recency runs from the moment a post goes out. A post published while readers sleep is hours old when they wake. An Amsterdam consultant with clients in New York who posts at 09:00 local time lands at three in the morning for those clients. A reasonable practice is to pick the region where most readers work and post in their morning.",
      },
      {
        type: "list",
        items: [
          "Mostly one region: a morning slot in that region's timezone.",
          "Split between Europe and the east coast of the United States: late morning in Europe, which is early morning in New York.",
          "Spread worldwide: the region where the paying clients sit, accepting that others see the post later.",
        ],
      },
      {
        type: "p",
        text: "Daylight saving shifts a slot set in the wrong timezone by an hour, twice a year. A slot set in the audience's timezone stays at nine in their morning all year.",
      },
      { type: "h2", text: "Why one fixed slot helps the author" },
      {
        type: "p",
        text: "The stronger evidence concerns the author's behaviour. Lally and colleagues followed 96 volunteers who repeated one daily behaviour in the same context for 12 weeks [3]. Automaticity rose with repetition along a curve that levelled off. The time to reach 95% of that plateau ranged from 18 to 254 days [3]. Missing one opportunity did not materially affect the process [3].",
      },
      {
        type: "p",
        text: "A later review by Gardner, Lally and Wardle turns this into advice: repeat a chosen behaviour in the same context until it becomes automatic [4]. A fixed posting slot is such a context. It removes a daily decision about whether now is a good moment.",
      },
      {
        type: "p",
        text: "Plans of the form 'if situation Y, then behaviour X' help in a similar way. A meta-analysis of 94 tests found that these plans, called implementation intentions, had a medium-to-large effect on goal attainment, d = .65 [5]. A rule such as 'every weekday at 09:00, a post goes out' has that shape.",
      },
      { type: "h2", text: "Batching makes the slot possible" },
      {
        type: "p",
        text: "Few people keep a daily slot by writing each post that morning. A common practice is to write in batches and let the posting run on its own.",
      },
      {
        type: "steps",
        items: [
          "One writing session a week, protected like a client meeting.",
          "Enough posts written or approved to fill every slot in the following week, plus one spare.",
          "Each post scheduled into its slot as soon as it is ready.",
          "A short list of evergreen posts for weeks when the session falls through.",
          "One queue check midweek, so an empty day does not come as a surprise.",
        ],
      },
      { type: "h2", text: "An example week" },
      {
        type: "p",
        text: "A founder posting four times a week to a mostly European audience might run the schedule below. It is an illustration. No study backs these exact hours.",
      },
      {
        type: "list",
        items: [
          "Friday, 15:00 to 16:30: writing session for the next week.",
          "Monday, Tuesday, Thursday and Friday, 09:00 Amsterdam time: posts go out.",
          "Each posting day, a first look at comments around 09:30 and a second at lunch.",
          "Wednesday: no post, and the time goes to commenting on other people's posts.",
        ],
      },
      { type: "h2", text: "When to break the schedule" },
      {
        type: "p",
        text: "Some posts belong to a moment: a launch, a talk given that day, news in the field. Those go out when they matter. If a timely post takes the day's slot, the planned post moves to the next free day. Holidays are the other exception. On days when most readers are off work, a pause planned at the start of the month beats an empty slot found later.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "Every GoodSocials board publishes at 09:00 in the board's timezone. The zone comes from the browser at onboarding and can be changed in settings. The calendar holds one post per day per profile. A ready card dragged onto a day is scheduled for that morning. The dashboard leads with posts published this month and the current streak.",
      },
    ],
    references: [
      {
        title:
          "LinkedIn (2026). LinkedIn relevance: optimizing the member experience. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1339724",
      },
      {
        title:
          "Dangi, S., Jia, J., Somaiya, M. and Xuan, Y. (2020). Understanding dwell time to improve LinkedIn feed ranking. LinkedIn Engineering Blog.",
        url: "https://www.linkedin.com/blog/engineering/feed/understanding-feed-dwell-time",
      },
      {
        title:
          "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W. and Wardle, J. (2010). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology.",
        url: "https://doi.org/10.1002/ejsp.674",
      },
      {
        title:
          "Gardner, B., Lally, P. and Wardle, J. (2012). Making health habitual: the psychology of habit-formation and general practice. British Journal of General Practice.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/",
      },
      {
        title:
          "Gollwitzer, P. M. and Sheeran, P. (2006). Implementation intentions and goal achievement: a meta-analysis of effects and processes. Advances in Experimental Social Psychology.",
        url: "https://kops.uni-konstanz.de/handle/123456789/10973",
      },
    ],
  },
  {
    slug: "writing-with-ai-without-sounding-like-ai",
    title: "Writing with AI without sounding like AI",
    description:
      "Readers cannot reliably detect machine text, yet certain words and empty claims still mark it. The fixes that last are facts and written rules.",
    date: "2026-08-21",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Many LinkedIn readers believe they can spot a post written by a language model. The research is less flattering. In six experiments with 4,600 participants, people could not tell AI-written self-presentations from human ones [1]. Accuracy stayed near chance, at 50 to 52% [1]. Detection is therefore a weak worry. Two other problems matter more: posts that say little, and words that have become a house style of the models.",
      },
      { type: "h2", text: "Words that became common after 2023" },
      {
        type: "p",
        text: "Kobak and colleagues counted word frequencies in more than 15 million biomedical abstracts from 2010 to 2024 [2]. After LLMs arrived, certain style words rose abruptly. Among rare words, underscores and showcasing were two of the largest risers [2]. Of the 379 excess style words in 2024, 66% were verbs and 14% were adjectives [2]. The authors estimate that at least 13.5% of 2024 abstracts were processed with LLMs [2].",
      },
      {
        type: "p",
        text: "The study covers scientific abstracts. No comparable public study covers LinkedIn posts. The pattern still carries a warning. What the models add is mostly verbs and adjectives of style, with no new facts. The same families of words are easy to find in feed posts.",
      },
      {
        type: "list",
        items: [
          "Grand verbs where a plain one fits: navigate for handle, foster for build, transform for change.",
          "Abstract nouns: ecosystem, paradigm, journey, holistic.",
          "Intensifiers that add little: incredibly, deeply, profoundly.",
          "Openers that announce a topic instead of stating a point.",
          "Closers that ask for comments without having earned them.",
        ],
      },
      { type: "h2", text: "Sentence shapes worth editing out" },
      {
        type: "p",
        text: "No study cited here measures sentence shapes. The list below is a set of editing heuristics.",
      },
      {
        type: "list",
        items: [
          "The reversal: a sentence that denies one thing in order to announce another.",
          "Threes everywhere: every list with three items, every noun with three adjectives.",
          "One-line paragraphs for drama, repeated until the drama wears off.",
          "A tidy summary at the end that restates the post in softer words.",
          "A hedge after every claim, saying each situation is different.",
          "Long dashes as the main punctuation mark, where a comma or a full stop would do.",
        ],
      },
      { type: "h2", text: "The first-person trap" },
      {
        type: "p",
        text: "Jakesch and colleagues found that people treat first-person pronouns and family topics as signs of a human writer [1]. A model can produce those cues with ease, so the heuristic can be gamed [1]. A generated post that opens with 'I spent the weekend thinking about this' borrows that cue. It also states something that did not happen.",
      },
      {
        type: "p",
        text: "Disclosure has its own cost. Schilke and Reimann ran thirteen experiments and found that people who disclosed AI use were trusted less than people who did not [3]. That penalty was smaller than the one that followed when a third party exposed the AI use [3]. Hiding the tool is a poor bet as well.",
      },
      {
        type: "p",
        text: "One way through is to write company posts in the third person, naming the company and the source of each fact. The text then makes no claim about who sat at the keyboard. Whether this avoids the trust penalty is untested.",
      },
      { type: "h2", text: "Facts before style" },
      {
        type: "p",
        text: "A model with no facts fills the space with general statements. A reasonable practice is to supply facts before asking for text: the client's industry, the number that changed, the question from last week's call. No study cited here compares this with style instructions. The output can only be as specific as the input.",
      },
      { type: "h2", text: "Voice rules, written once" },
      {
        type: "p",
        text: "Editing every post by hand works for a week. A short rules document that goes into every request lasts longer.",
      },
      {
        type: "steps",
        items: [
          "A list of banned words, including the style words above.",
          "A target sentence length, for example one idea per sentence and a limit of 25 words.",
          "Punctuation rules, for example no long dashes and no exclamation marks.",
          "Two or three sample sentences from past writing the author liked.",
          "A description of the reader, since a software founder and a hospital buyer read differently.",
          "A new rule each time the same fix is made twice.",
        ],
      },
      {
        type: "p",
        text: "The last step matters most. The document grows from corrections, so the same mistake does not return every week.",
      },
      { type: "h2", text: "Read it aloud" },
      {
        type: "p",
        text: "An old editing test still works. A sentence the author would not say to a client across a table gets cut or rewritten.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "In GoodSocials a revise comment rewrites the card and updates the matching brand principle, so the correction carries to every future card. Posts are written in the third person by rule, naming the company and the source. A quality gate holds drafts with invented numbers, unsupported claims or no point to make, and shows the reason on the card.",
      },
    ],
    references: [
      {
        title:
          "Jakesch, M., Hancock, J. T. and Naaman, M. (2023). Human heuristics for AI-generated language are flawed. Proceedings of the National Academy of Sciences.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10089155/",
      },
      {
        title:
          "Kobak, D., González-Márquez, R., Horvát, E. and Lause, J. (2025). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. Science Advances.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/",
      },
      {
        title:
          "Schilke, O. and Reimann, M. (2025). The transparency dilemma: how AI disclosure erodes trust. Organizational Behavior and Human Decision Processes.",
        url: "https://par.nsf.gov/biblio/10597787",
      },
    ],
  },
  {
    slug: "first-hour-after-posting",
    title:
      "The first hour after posting, and why engagement pods are a bad trade",
    description:
      "LinkedIn's rules forbid pre-arranged likes and automated engagement. Replies to real comments are the part worth the author's time.",
    date: "2026-08-15",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "A post starts a conversation. Comments are where readers ask the follow-up question, add a case or disagree. That is often where a reader decides to get in touch. Many people who post often believe early comments help a post travel. LinkedIn has not published how much they help. The better reason to show up is plain: people who comment deserve a reply.",
      },
      { type: "h2", text: "What LinkedIn has said about engagement" },
      {
        type: "p",
        text: "The Help Center lists engagement among the feed's content signals, next to recency [1]. Activity signals include what a member has reacted to, commented on or shared [1]. LinkedIn Engineering has written that it tracks the velocity of likes, shares and comments to predict which posts will go viral [2]. Those predictions feed its spam and low-quality machinery, which picks content for manual review [2]. Early engagement is watched, and part of the reason is abuse.",
      },
      { type: "h2", text: "Being around when it goes out" },
      {
        type: "p",
        text: "A reasonable practice is to schedule posts for a time when the author can check back within an hour. Two short visits cover most of it: one soon after posting, one around lunch.",
      },
      {
        type: "list",
        items: [
          "A 09:00 post pairs with a free slot from 09:15 to 09:30.",
          "Notifications stay on for comments on the author's own posts and off for most other things.",
          "A morning full of meetings is a reason to move the slot.",
        ],
      },
      { type: "h2", text: "Replies that add something" },
      {
        type: "p",
        text: "A good reply answers the question, gives the detail that did not fit in the post, or asks about the commenter's own case.",
      },
      {
        type: "list",
        items: [
          "Questions get specifics. Asked how long a migration took, the author gives the number and the one thing that slowed it down.",
          "Thanks go through the content of the comment. A generic thanks ends the conversation.",
          "Disagreement gets taken seriously. A calm, useful reply to a critic shows readers how the author handles pushback.",
          "A commenter who mentions their own situation gets a follow-up question.",
          "Replies stay short, two or three sentences.",
        ],
      },
      { type: "h2", text: "Comments on other people's posts" },
      {
        type: "p",
        text: "The comment sections of people the audience already reads are a second place to be seen. A useful comment on a respected post can introduce the author to new readers.",
      },
      {
        type: "steps",
        items: [
          "A list of ten to twenty people whose readers the author wants to reach.",
          "Fifteen minutes on a quiet day reading their recent posts.",
          "Two or three comments that add a fact, an example or a real question.",
          "No comment where there is little to add.",
        ],
      },
      { type: "h2", text: "What engagement pods are" },
      {
        type: "p",
        text: "A pod is a group that agrees to like and comment on each member's posts, often within minutes of publishing. Most coordinate in a chat group. Some are paid services that run automated accounts. The aim is to make a post look popular early, so the feed shows it to more people.",
      },
      { type: "h2", text: "What LinkedIn's rules say" },
      {
        type: "p",
        text: "LinkedIn's Professional Community Policies ask members not to artificially increase engagement with their content. They also ask members not to agree with others ahead of time to like or re-share each other's content [3]. That is a pod, described without the word.",
      },
      {
        type: "p",
        text: "The User Agreement goes further. It forbids bots or other unauthorized automated methods that create, comment on, like, share or re-share posts, or otherwise drive inauthentic engagement [4]. The Help Center adds that third-party software which automates activity on the site is not allowed [5]. Accounts can be restricted for automated activity [5].",
      },
      { type: "h2", text: "Why pods are a bad trade" },
      {
        type: "list",
        items: [
          "The comments are thin. Generic praise from strangers outside the field tells real readers the post was propped up.",
          "The wrong people see the post. Reach among a pod's networks is reach among people who are unlikely to buy.",
          "It costs time. Commenting on twenty unrelated posts a day to earn a share of attention is an hour taken from writing or clients.",
          "It spoils the data. When many reactions were owed, the author cannot tell whether the post worked.",
          "It breaks the rules above, which puts the account at risk [3] [4].",
        ],
      },
      {
        type: "p",
        text: "Auto-likers and comment bots fall under the same clause of the User Agreement [4].",
      },
      { type: "h2", text: "A practice that fits the rules" },
      {
        type: "p",
        text: "Early activity can be earned. A post can end on a specific question that people in the field hold views on. Colleagues and clients can be told, one message at a time, when a post concerns them. Every real comment gets a reply. No public study measures how much this helps reach. Over months it builds a group of readers who comment because they want to.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes and publishes posts to personal LinkedIn profiles. It does not reply to comments, send messages, join pods or auto-like posts. Those parts belong to the person whose name is on the post. Posts go out at 09:00 in the board's timezone, so the author knows when to check in.",
      },
    ],
    references: [
      {
        title:
          "LinkedIn (2026). LinkedIn relevance: optimizing the member experience. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1339724",
      },
      {
        title:
          "Bhatt, R. and Saltman, B. (2017). Strategies for keeping the LinkedIn feed relevant. LinkedIn Engineering Blog.",
        url: "https://www.linkedin.com/blog/engineering/feed/strategies-for-keeping-the-linkedin-feed-relevant",
      },
      {
        title: "LinkedIn (2026). Professional Community Policies.",
        url: "https://www.linkedin.com/legal/professional-community-policies",
      },
      {
        title: "LinkedIn (2025). User Agreement, section 8.2.",
        url: "https://www.linkedin.com/legal/user-agreement",
      },
      {
        title:
          "LinkedIn (2026). Automated activity on LinkedIn. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1340567",
      },
    ],
  },
  {
    slug: "content-themes-for-linkedin",
    title: "Content themes for LinkedIn: four subjects that outlast week four",
    description:
      "A small fixed set of themes gives each writing session a starting point and gives readers a steady subject to connect with a name.",
    date: "2026-08-10",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "The first two weeks of posting are easy. Founders arrive with saved ideas: how the company started, last year's big lesson, the thing clients should know. By week four those are used up. Each Monday starts from a blank page. A small set of themes, chosen once, gives every writing session a starting point and keeps the feed from drifting.",
      },
      { type: "h2", text: "What a theme is" },
      {
        type: "p",
        text: "A theme is a subject the author knows well enough to write about for a year, and that readers care about. It is broader than a post idea and narrower than an industry. Marketing is too wide. The first ad campaign for a small software company is too narrow. Paid acquisition for early-stage software companies is about right.",
      },
      { type: "h2", text: "Why repeating a subject helps" },
      {
        type: "p",
        text: "Repeated exposure tends to raise liking, up to a point. A meta-analysis by Montoya and colleagues pooled 268 curve estimates from 81 articles [1]. Exposure and liking followed an inverted U [1]. Liking rose with exposure, peaked and then declined. The studies used laboratory stimuli. In the sources reviewed, no study tested LinkedIn posts. The finding still argues for a middle path: the same few subjects, in varied posts.",
      },
      { type: "h2", text: "What LinkedIn has said about topics" },
      {
        type: "p",
        text: "LinkedIn does not publish its ranking model. It has described parts of it. The Help Center says identity signals include profile details such as skills [2]. Activity signals include what a member has reacted to and what they spend the most time viewing [2].",
      },
      {
        type: "p",
        text: "A 2026 LinkedIn Engineering post describes a retrieval system that infers likely interests and content areas from member-provided information [3]. It also describes a model built from more than a thousand of a member's past interactions [3]. A feed that models interests over time plausibly favours authors who stay within a stable set of topics. LinkedIn has not said so directly, so this remains a hypothesis.",
      },
      { type: "h2", text: "Why four" },
      {
        type: "p",
        text: "No study sets the right number, so four is a working choice. One theme gets repetitive. Ten make a feed feel scattered. At a daily cadence, four themes bring each one up more than once a week. A reader who has seen a dozen posts can still say what the author does.",
      },
      { type: "h2", text: "Finding the four" },
      {
        type: "steps",
        items: [
          "The website comes first. Its services and product features are what the author wants to be known for.",
          "The questions clients and prospects ask most often, grouped. Each cluster can become a theme.",
          "What the author knows from experience that most peers do not. Receipts and findings come from here.",
          "What readers should think of when they see the name a year from now.",
          "Four subjects that cover those lists with the least overlap, each written as one line.",
        ],
      },
      { type: "h2", text: "Two examples" },
      {
        type: "p",
        text: "A fractional finance lead who works with startups:",
      },
      {
        type: "list",
        items: [
          "Cash runway and forecasting for companies under 30 people.",
          "Preparing for a first funding round: what investors ask for and how to have it ready.",
          "Pricing and billing decisions and their effect on cash.",
          "Finance tools and processes that save time for a founder doing the books.",
        ],
      },
      {
        type: "p",
        text: "A two-person design studio that builds websites for architects:",
      },
      {
        type: "list",
        items: [
          "How architects win work through their website, with examples from projects.",
          "Photography and presentation of built work online.",
          "Running a small studio: pricing, scoping, working with clients.",
          "Website decisions that matter less than people think, and the few that matter more.",
        ],
      },
      { type: "h2", text: "Rotating through them" },
      {
        type: "p",
        text: "Posts are dealt across the four so no single theme takes over. When one theme feels exhausted, it can rest while the others carry the week. Themes also combine. A pricing decision can be told through a finding from client work.",
      },
      { type: "h2", text: "Angles inside each theme" },
      {
        type: "p",
        text: "A theme is a prompt that can be reused. Each one can run through several angles.",
      },
      {
        type: "list",
        items: [
          "A framework: the steps or questions the author uses.",
          "A number: something measured in the author's own work.",
          "A finding: an observation that runs against common advice.",
          "A mistake: what went wrong and what changed afterwards.",
          "A question: something a client asked this month, and the answer.",
        ],
      },
      {
        type: "p",
        text: "Four themes times five angles gives twenty ideas before any writing starts. Each angle comes back with new material. A running note per theme catches the good client question or the surprising number when it happens.",
      },
      { type: "h2", text: "A review every quarter" },
      {
        type: "p",
        text: "Themes should change as the business does. A reasonable practice is to look at the posts under each theme every three months. A theme that has not produced a strong post in three months gets replaced. A new service that has become important gets a theme. The aim is a feed that describes the business as it is now.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes four themes for each profile from the member's website at onboarding, and they can be edited at any time. New ideas are spread across all four. The board keeps finding subjects after the homepage is used up, so week four does not read like week one.",
      },
    ],
    references: [
      {
        title:
          "Montoya, R. M., Horton, R. S., Vevea, J. L., Citkowicz, M. and Lauber, E. A. (2017). A re-examination of the mere exposure effect: the influence of repeated exposure on recognition, familiarity, and liking. Psychological Bulletin.",
        url: "https://doi.org/10.1037/bul0000085",
      },
      {
        title:
          "LinkedIn (2026). LinkedIn relevance: optimizing the member experience. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a1339724",
      },
      {
        title:
          "Danchev, H. (2026). Engineering the next generation of LinkedIn's Feed. LinkedIn Engineering Blog.",
        url: "https://www.linkedin.com/blog/engineering/feed/engineering-the-next-generation-of-linkedins-feed",
      },
    ],
  },
  {
    slug: "what-to-measure-on-linkedin",
    title:
      "What to measure on LinkedIn: posts published and streak before impressions",
    description:
      "Impressions are estimates driven by signals LinkedIn does not publish. Posts published and the current streak are inputs the author controls.",
    date: "2026-08-04",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "LinkedIn shows plenty of numbers: impressions, reactions, followers, profile views. Checking them after every post is tempting. For a founder or consultant in the first year of posting, that habit can do more harm than good.",
      },
      { type: "h2", text: "What the numbers are" },
      {
        type: "p",
        text: "LinkedIn's Help Center defines impressions as the number of times a post was shown [1]. Members reached is the number of distinct members and Pages that saw it, and LinkedIn calls that number an estimate [1]. The same page says post analytics are estimates and may not be precise [1].",
      },
      {
        type: "p",
        text: "What drives these numbers is mostly hidden. LinkedIn says its feed weighs hundreds of signals, including the context of a post and the viewer's profile, network and activity [2]. It does not publish the weights. One post's impressions therefore mix the quality of the post with factors the author cannot see.",
      },
      { type: "h2", text: "When a measure becomes the target" },
      {
        type: "p",
        text: "Goodhart's law names a known failure. Manheim and Garrabrant describe it as optimizing a system on a metric past the point where further optimization helps, until it becomes ineffective or harmful [3]. Muller documents the pattern in schools, medicine, business and government, including the gaming of statistics [4].",
      },
      {
        type: "p",
        text: "On LinkedIn the pattern is easy to picture. If reactions are the goal, the easiest route is broad, agreeable posts that most readers can like. Such posts say little about what the author sells. This is a hypothesis about LinkedIn in particular. No public study tests it.",
      },
      { type: "h2", text: "Inputs the author controls" },
      {
        type: "list",
        items: [
          "Posts published this month, against the planned cadence. Twelve planned and seven published is the first problem to solve.",
          "The current streak: scheduled slots filled in a row without a gap.",
        ],
      },
      {
        type: "p",
        text: "These numbers are dull by design. They show whether the work that makes the rest possible is being done. A reputation cannot rest on posts that stayed unpublished.",
      },
      { type: "h2", text: "Outcomes, reviewed monthly" },
      {
        type: "p",
        text: "Once the cadence holds, outcomes can be reviewed over a month or a quarter. The useful ones connect to the business.",
      },
      {
        type: "list",
        items: [
          "Conversations started, where the other person mentioned the posts.",
          "Inbound leads that name LinkedIn as the source, captured with a question on the contact form.",
          "Website visits from LinkedIn, tracked with UTM parameters on shared links.",
          "Comments from the people the author wants to reach. Ten from potential clients count for more than a hundred from strangers.",
        ],
      },
      { type: "h2", text: "A monthly review" },
      {
        type: "steps",
        items: [
          "On the first working day, last month's posts published go down next to the planned cadence, with the longest streak.",
          "Conversations and leads from LinkedIn get counted in a CRM or a spreadsheet.",
          "The three posts that started the best conversations get compared, whatever their impressions.",
          "One thing changes for the next month: a theme, a format or a posting day. A single change keeps its effect readable.",
          "A missed cadence gets fixed before other changes.",
        ],
      },
      { type: "h2", text: "When impressions matter" },
      {
        type: "p",
        text: "Impressions still carry information. Over three to six months, a steady rise suggests more people see the work. A sudden drop across many posts can point to a change worth checking. Read monthly as a trend line, they are useful. Read as a verdict on one post, they mislead.",
      },
      {
        type: "p",
        text: "Followers work the same way. A useful monthly check is how many recent followers work at the kind of company the author sells to. A rising share means the posts reach the right people, whatever the total says.",
      },
      { type: "h2", text: "Giving it long enough" },
      {
        type: "p",
        text: "Many authors stop after six weeks because the numbers did not move. Habit research suggests patience on the author's side as well. In the study by Lally and colleagues, the time to reach a plateau of automaticity for one daily behaviour ranged from 18 to 254 days [5]. A reasonable practice is a commitment of three to six months at a cadence that can be kept. Inputs get checked weekly and outcomes get judged at the end.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "The GoodSocials dashboard leads with posts published this month and the current streak. It has no impressions or follower dashboard. Cadence is what GoodSocials sells, so cadence is what the dashboard shows.",
      },
    ],
    references: [
      {
        title: "LinkedIn (2026). Post analytics. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a516971",
      },
      {
        title: "LinkedIn (2026). How the Feed ranks content. LinkedIn Help.",
        url: "https://www.linkedin.com/help/linkedin/answer/a9554004",
      },
      {
        title:
          "Manheim, D. and Garrabrant, S. (2018). Categorizing variants of Goodhart's law. arXiv.",
        url: "https://arxiv.org/abs/1803.04585",
      },
      {
        title:
          "Muller, J. Z. (2018). The tyranny of metrics. Princeton University Press.",
        url: "https://press.princeton.edu/books/hardcover/9780691174952/the-tyranny-of-metrics",
      },
      {
        title:
          "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W. and Wardle, J. (2010). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology.",
        url: "https://doi.org/10.1002/ejsp.674",
      },
    ],
  },
];
