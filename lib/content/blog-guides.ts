import type { BlogPost } from "./types";

/** The how-to searches: writing, scheduling, length, formatting and hashtags on LinkedIn. */
export const GUIDE_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-a-linkedin-post",
    title: "How to write a LinkedIn post, from idea to publish",
    description:
      "Pick one point, open with the most specific line, give the body a shape, end without bait, then edit. A step by step guide with a checklist.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "To write a LinkedIn post, pick one point you can back with something you saw or did, open with the most specific sentence you have, give the body a simple shape, and stop when the point is made. Then read it once on a phone and cut every line that does not move the reader forward. The rest of this guide walks through each step with examples.",
      },
      {
        type: "p",
        text: "None of it depends on knowing how LinkedIn ranks posts, which LinkedIn does not publish. It depends on writing something a reader in your field would want to finish.",
      },
      { type: "h2", text: "Step one: pick the one point" },
      {
        type: "p",
        text: "Most weak posts try to say three things. A reader scrolling the feed can hold one. Before you write a word, finish this sentence: 'After reading this, the reader will know that...' If you need 'and' to finish it, you have two posts.",
      },
      {
        type: "p",
        text: "Good points come from your own work more often than from the news. Look at the last week for moments where something surprised you, a client asked a sharp question, or a number moved.",
      },
      {
        type: "list",
        items: [
          "A question a client asked that you answered well, or badly.",
          "A number from your billing, analytics or pipeline that changed, and why.",
          "A decision you made and the tradeoff behind it.",
          "A mistake you fixed and what you would check first next time.",
          "A method you use every week that others in your field do differently.",
        ],
      },
      {
        type: "p",
        text: "If you cannot say where the point came from, it is probably an opinion anyone could post. Those are the easiest posts to scroll past.",
      },
      { type: "h2", text: "Step two: write the opening" },
      {
        type: "p",
        text: "LinkedIn folds longer posts behind a 'see more' link after the first few lines. Those lines decide whether anyone reads on, so they need to name the subject in concrete terms and give the reader a reason to care.",
      },
      {
        type: "p",
        text: "The quickest way to a good opening is to write the body first, find the most specific sentence in it, and move that to the top. Compare these two:",
      },
      {
        type: "list",
        items: [
          "Vague: 'Onboarding matters more than most founders think.'",
          "Specific: 'A client cut onboarding from nine steps to four. Support tickets in week one halved.'",
        ],
      },
      {
        type: "p",
        text: "The second one names a situation, a change and a result. The reader knows what the post is about and wants to know how. Avoid openings that promise a surprise without naming anything, and avoid a greeting or a warm-up line. The reader has not agreed to read the second sentence yet.",
      },
      { type: "h2", text: "Step three: give the body a shape" },
      {
        type: "p",
        text: "A post with a shape is easier to write and easier to read. Pick one before you draft, based on what the point is.",
      },
      {
        type: "list",
        items: [
          "Before and after: what it looked like, what changed, what it looks like now, and the one thing that made the difference.",
          "Framework: a short numbered set of steps or questions, each with one line of explanation.",
          "Receipt: a number you own, where it came from, and what it means for someone in the reader's position.",
          "Finding: something you noticed across several cases, the evidence, and what to do about it.",
          "Answer: a question someone asked you, and your answer in plain words.",
        ],
      },
      {
        type: "p",
        text: "Whatever the shape, keep paragraphs to one to three short sentences and use a line break between them. Most people read LinkedIn on a phone, where a five line paragraph turns into a wall.",
      },
      {
        type: "p",
        text: "Use concrete nouns wherever you can. 'A four person accounting firm in Leeds' tells the reader more than 'a small business'. A number you can stand behind beats an adjective. If you do not have the number, leave a gap and go and get it rather than rounding a guess.",
      },
      { type: "h2", text: "Step four: end without engagement bait" },
      {
        type: "p",
        text: "The last line should close the point. Good endings do one of three things: state the lesson in a sentence, say what you would do differently, or tell the reader what to try this week.",
      },
      {
        type: "p",
        text: "Skip the lines that exist only to farm reactions: 'Agree?', 'Comment YES if you want the template', 'Tag someone who needs this'. Readers recognise them, and they make a useful post read like a trick. If you want comments, write something people have a real view on, and they will leave one without being asked.",
      },
      {
        type: "p",
        text: "A genuine question is fine when you want the answers. 'How do you price the first month for a new retainer?' invites people who know something. 'Thoughts?' invites nothing.",
      },
      { type: "h2", text: "Step five: the edit pass" },
      {
        type: "p",
        text: "Leave the draft for at least an hour, ideally overnight. Then edit in this order, because each pass makes the next one easier.",
      },
      {
        type: "steps",
        items: [
          "Read only the first two lines. Would you tap 'see more' if a stranger wrote them? If not, find a more specific opening in the body.",
          "Cut the throat clearing. The first paragraph of most drafts is warm-up and can go.",
          "Check every claim. Each number and each fact should be something you can point to.",
          "Remove filler words and hedges that add length without meaning.",
          "Read it aloud. Anywhere you stumble, the reader will too.",
          "Look at it on a phone. Break long paragraphs and check where the fold lands.",
        ],
      },
      {
        type: "p",
        text: "A good edit usually makes a post shorter. If yours got longer, you probably added explanation the reader did not need.",
      },
      { type: "h2", text: "Step six: publish at a time you can repeat" },
      {
        type: "p",
        text: "Publish when your readers are starting their working day, in their timezone, and pick one slot you can keep every posting day. A post on a steady rhythm does more over a year than a brilliant post followed by a month of silence. If you write in batches, schedule the posts rather than holding them in drafts, so the rhythm survives a busy week.",
      },
      { type: "h2", text: "A checklist before you post" },
      {
        type: "list",
        items: [
          "The post makes one point, and you can say it in a sentence.",
          "The first two lines name the subject and give a reason to read on.",
          "The body has a clear shape: before and after, framework, receipt, finding or answer.",
          "Every number is yours or has a named source.",
          "Paragraphs are short and separated by line breaks.",
          "The ending closes the point and does not beg for reactions.",
          "You read it aloud and on a phone.",
          "It goes out in your usual slot.",
        ],
      },
      { type: "h2", text: "Common mistakes to avoid" },
      {
        type: "list",
        items: [
          "Writing about a topic instead of a situation. 'Hiring is hard' is a topic. 'Two hires in a row left after six weeks, and the job ad was the reason' is a situation.",
          "Explaining the lesson three times in different words.",
          "Starting with context the reader does not need yet, such as how long you have worked in the field.",
          "Adding a list of hashtags at the end out of habit.",
          "Posting the same shape every time until readers can guess the post from its first line.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials writes each post from an idea with its shape chosen up front, such as a framework, a data breakdown or a receipt, and puts the draft on your board to approve, revise or reject. When a receipt needs a number only you know, the card asks you for it instead of inventing one.",
      },
      {
        type: "p",
        text: "If a draft gets something wrong, a revise comment rewrites that card and updates the matching brand principle, so the next post starts from your correction. A quality gate holds any draft with an invented number, an unsupported claim or nothing to say before it can be scheduled.",
      },
    ],
    related: [
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/how-to-format-linkedin-posts",
      "/blog/receipts-beat-opinions",
      "/blog/linkedin-post-templates",
    ],
  },
  {
    slug: "how-to-schedule-linkedin-posts",
    title: "How to schedule LinkedIn posts, with and without a tool",
    description:
      "Schedule a LinkedIn post from the composer's clock icon, or use a tool for a queue and approvals. What each option does, what it costs you, and when to post.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "You can schedule a LinkedIn post without any extra tool: write it in LinkedIn's post composer, click the clock icon next to the Post button, pick a date and time, and confirm. For one post at a time that is enough. If you want a queue of posts, an approval step, or several profiles in one place, you need a third-party scheduler, and every one of them will ask you to reconnect LinkedIn about every 60 days.",
      },
      {
        type: "p",
        text: "Below is how the built-in scheduler works, where it stops, what to look for in a tool, and how to choose the time.",
      },
      { type: "h2", text: "How to schedule a post on LinkedIn itself" },
      {
        type: "p",
        text: "LinkedIn moves its menus from time to time, so treat these steps as a guide to what to look for rather than an exact map. At the time of writing, September 2026, the flow on desktop works like this:",
      },
      {
        type: "steps",
        items: [
          "Open LinkedIn and click 'Start a post' at the top of your feed.",
          "Write the post, and add an image or document if you want one.",
          "Look for the clock icon next to the Post button. If it is not there, check the menu behind the three dots or the options below the text box.",
          "Choose a date and a time. The time is shown in your own timezone.",
          "Confirm, then click Schedule. The post is now waiting and will not show on your profile until the time arrives.",
        ],
      },
      {
        type: "p",
        text: "To see or change what you have scheduled, open the composer again and look for the option to view scheduled posts, usually near the clock icon. From there you can reschedule or delete a post before it goes out. The mobile app offers the same feature, though the icon may sit in a different place.",
      },
      { type: "h2", text: "Where LinkedIn's scheduler stops" },
      {
        type: "p",
        text: "The built-in scheduler is good at one job: holding a finished post until a set time. It was not designed as a publishing system, and the gaps show once you post more than once a week.",
      },
      {
        type: "list",
        items: [
          "One post at a time. You pick a date and time for each post by hand. There is no recurring slot such as 'every weekday at nine'.",
          "No queue. You cannot line up ten posts and have them fill the next ten free slots in order.",
          "No approval step. Whoever schedules the post is the one who approves it. A colleague, client or editor cannot sign off inside LinkedIn before it goes out.",
          "No calendar view of your plan beside what you already published, so gaps are easy to miss.",
          "One profile per login. Managing posts for several people means logging in as each of them.",
        ],
      },
      {
        type: "p",
        text: "For someone who writes a post on Sunday for Tuesday morning, none of this matters. For someone posting close to daily, or managing a client's profile, it is most of the work.",
      },
      { type: "h2", text: "How third-party schedulers work" },
      {
        type: "p",
        text: "LinkedIn's API has no scheduling endpoint. A tool cannot hand LinkedIn a post and a time and let LinkedIn take care of it. Instead, every scheduler stores your post on its own servers and publishes it through the API when the time comes. That is why the tool needs permission to post as you.",
      },
      {
        type: "p",
        text: "That permission does not last. When you connect LinkedIn to a third-party app, the access LinkedIn grants lasts 60 days, and standard apps get no way to renew it quietly in the background. So every tool that posts to your personal profile has to ask you to sign in with LinkedIn again about every 60 days. It is a LinkedIn rule, and it applies to every scheduler equally.",
      },
      {
        type: "p",
        text: "The risk is what happens if you miss the prompt. The posts are still in the tool's queue, the calendar still looks full, and nothing goes out. If you manage a client's profile, the first you may hear of it is from the client.",
      },
      { type: "h2", text: "What to look for in a scheduler" },
      {
        type: "list",
        items: [
          "Clear warning before access expires, by email and in the app, with enough days to act.",
          "What happens when access does expire. The honest answer is that scheduling pauses and you are told, rather than posts failing one by one in silence.",
          "A queue or recurring slots, so approved posts fill the calendar without picking a time for each.",
          "An approval step if anyone other than the author signs off.",
          "Scheduling in the timezone of your audience, so a 09:00 slot stays at 09:00 when the clocks change.",
          "Personal profile support. Posting to company pages uses a separate LinkedIn permission that not every tool has.",
          "Pricing that fits how you work. Some tools charge per channel, some per user, some per profile. Count what you will connect before you compare.",
        ],
      },
      {
        type: "p",
        text: "General schedulers such as Buffer or Hootsuite cover many networks and suit teams posting the same content in several places. LinkedIn-specific tools focus on writing and scheduling for LinkedIn alone. Neither is better in general; it depends on whether LinkedIn is one channel of many or the main one.",
      },
      { type: "h2", text: "What time to schedule posts" },
      {
        type: "p",
        text: "LinkedIn does not publish when posts perform best, and the charts you see online are usually drawn from one tool's customers, in one mix of industries and timezones. A sensible default is the start of the working day for your readers, in their timezone. Then keep it fixed.",
      },
      {
        type: "list",
        items: [
          "Schedule for your audience's morning, not your own, if they live elsewhere.",
          "Use one slot for every posting day, so readers who see you regularly know when to expect you.",
          "Keep a full day between posts. Two posts a few hours apart compete with each other.",
          "Check your own results over several weeks before changing the slot. One post proves nothing.",
        ],
      },
      { type: "h2", text: "A simple weekly routine" },
      {
        type: "steps",
        items: [
          "Write or approve next week's posts in one sitting, on the same day each week.",
          "Schedule each one into its slot as soon as it is finished.",
          "Check the calendar midweek so an empty day is never a surprise.",
          "Reply to comments after each post goes out. Scheduling handles the posting; conversations still need you.",
          "Set a reminder for the day your LinkedIn connection is due to expire, if your tool does not warn you.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials keeps a board of approved posts and publishes one a day at 09:00 in your board's timezone. You approve cards from the board or drag a ready card onto a day in the calendar, and the publish loop checks for due posts every 15 minutes.",
      },
      {
        type: "p",
        text: "Because LinkedIn access lasts 60 days, GoodSocials emails you on day 50, shows a banner on day 55, and if the connection lapses it pauses scheduling cleanly and tells you, instead of letting posts fail one by one.",
      },
    ],
    related: [
      "/blog/best-time-to-post-on-linkedin",
      "/blog/how-often-to-post-on-linkedin",
      "/blog/linkedin-content-calendar",
      "/blog/buffer-alternatives-for-linkedin",
    ],
  },
  {
    slug: "linkedin-post-character-limit",
    title: "LinkedIn post character limit, and how much of it to use",
    description:
      "A LinkedIn post can be 3,000 characters. Here is what that looks like, how much shows before 'see more', and how to decide the right length for a post.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "A LinkedIn post can be up to 3,000 characters long, counting spaces, line breaks and emoji. That is roughly 400 to 500 words of plain English, or about a page of a paperback. Only the first few lines show in the feed before LinkedIn folds the rest behind 'see more', so the limit matters less than what you put above that fold.",
      },
      {
        type: "p",
        text: "Here is how the limit works in practice, the other limits you may run into, and how to pick a length for each post.",
      },
      { type: "h2", text: "What counts toward the 3,000 characters" },
      {
        type: "list",
        items: [
          "Every letter, digit, space and punctuation mark.",
          "Line breaks. A post with lots of white space between short lines uses some of its limit on the breaks.",
          "Emoji. Many count as more than one character, because of how they are stored.",
          "Links, in full. A long tracking link can take a noticeable bite out of the limit.",
          "Mentions of people and companies, as their displayed names.",
        ],
      },
      {
        type: "p",
        text: "If you write in another app and paste into LinkedIn, the composer will stop you at the limit. Some tools cut the text at 3,000 characters without warning, which can leave a post ending in the middle of a sentence. Check the last line before you publish.",
      },
      { type: "h2", text: "Other LinkedIn character limits" },
      {
        type: "p",
        text: "At the time of writing, September 2026, these are the other limits people most often ask about. LinkedIn changes them occasionally, so check the counter in the edit box if you are close to one.",
      },
      {
        type: "list",
        items: [
          "Comment: 1,250 characters.",
          "Profile headline: 220 characters.",
          "About section on your profile: 2,600 characters.",
        ],
      },
      {
        type: "p",
        text: "Articles and newsletters published on LinkedIn are a separate format with much more room. If what you want to say needs more than 3,000 characters, that may be the better home for it, with a short post pointing to it.",
      },
      { type: "h2", text: "How much shows before 'see more'" },
      {
        type: "p",
        text: "There is no single number. The fold depends on the device, the screen width, the app or browser, and how many line breaks you use near the top. On a phone the reader often sees two or three lines. On a wide desktop screen they may see a little more. A line break early in the post can move the fold up, because each break takes a line of its own.",
      },
      {
        type: "p",
        text: "Treat the first two lines as the only part everyone sees. Write them so a reader who stops there still knows what the post is about and why it might be worth opening.",
      },
      {
        type: "steps",
        items: [
          "Put the most specific fact, number or situation in the first sentence.",
          "Use the second line to say why it matters or what the reader will get.",
          "Preview the post on your phone before publishing, or paste it into a narrow window, and see where the cut falls.",
          "If the fold lands on a greeting or background, move the substance up.",
        ],
      },
      { type: "h2", text: "Is a long post better than a short one?" },
      {
        type: "p",
        text: "There is no rule, and LinkedIn does not publish one. You will see advice claiming long posts reach more people and advice claiming short posts do. Neither comes with evidence you can check, and both ignore the thing that decides most outcomes: whether the post is worth reading.",
      },
      {
        type: "p",
        text: "A better test is whether every line earns its place. A 2,500 character post that walks through a decision step by step, with the numbers, can hold a reader to the end. A 2,500 character post that makes one point four times will lose them in the second paragraph. A 400 character post with one sharp observation can do more than either.",
      },
      {
        type: "list",
        items: [
          "Go long when the post needs steps, evidence or a worked example, and each paragraph adds something new.",
          "Go short when the point is one observation, one number or one answer. Saying it and stopping shows confidence.",
          "Cut when you catch yourself restating the point, adding a summary of what you already said, or explaining why the post matters.",
        ],
      },
      { type: "h2", text: "How to cut a post that is too long" },
      {
        type: "p",
        text: "If a draft is over the limit, or close to it and still growing, it usually has too many ideas. Cutting words from every sentence rarely fixes that. Cutting whole parts does.",
      },
      {
        type: "steps",
        items: [
          "Write the single point of the post in one sentence. Anything that does not serve that sentence goes.",
          "Delete the opening paragraph and see if the post still works. It usually does.",
          "Keep the three strongest examples or steps and drop the rest.",
          "Remove the closing summary. The reader has read the post a moment ago.",
          "If what is left is still too long, split it into two posts on different days.",
        ],
      },
      {
        type: "p",
        text: "Splitting is often the best answer. Two posts that each make one point are easier to read than one post that makes two, and they give you a second day on the calendar.",
      },
      { type: "h2", text: "Short posts need more care, not less" },
      {
        type: "p",
        text: "A very short post has nowhere to hide. Without the space to explain, the one line you do write has to be specific. 'Pricing is a product decision' is short and says little. 'A client moved pricing from the finance team to the product team, and the next change shipped in two weeks instead of two quarters' is short and says a lot.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials checks every draft against LinkedIn's 3,000 character limit before it can be scheduled. A post that hit the limit and was cut mid sentence is held on the board with the reason and a suggested revise comment, and the publish loop checks again before posting, so a truncated post never reaches your feed.",
      },
      {
        type: "p",
        text: "If you prefer shorter or longer posts, say so in a revise comment. It updates the format principle, and later drafts follow it.",
      },
    ],
    related: [
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/how-to-format-linkedin-posts",
      "/blog/how-to-write-a-linkedin-post",
      "/blog/picking-a-format-text-image-carousel-video",
    ],
  },
  {
    slug: "how-to-format-linkedin-posts",
    title: "How to format a LinkedIn post so people read it",
    description:
      "Short paragraphs, line breaks, simple lists, careful bold, and links in the right place. How to format a LinkedIn post that is easy to read on a phone.",
    date: "2026-09-27",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "Format a LinkedIn post for a phone screen: short paragraphs of one to three sentences, a blank line between them, a plain list when you have steps or items, and no more than a word or two of fancy bold text. LinkedIn's composer has no built-in bold, italics or headings, so formatting comes down to line breaks, lists and restraint.",
      },
      {
        type: "p",
        text: "The rest of this guide covers each tool you have, what it costs, and a before and after example.",
      },
      { type: "h2", text: "Line breaks and short paragraphs" },
      {
        type: "p",
        text: "Line breaks are the most useful formatting you have. Most people read the feed on a phone, where a column is narrow and a paragraph of six sentences becomes a block of fifteen lines. Readers skip blocks.",
      },
      {
        type: "list",
        items: [
          "Keep each paragraph to one idea, usually one to three sentences.",
          "Leave a blank line between paragraphs so the eye has somewhere to rest.",
          "Put a break after your first sentence. It gives the opening room and makes it easier to read in the feed.",
          "Do not break after every sentence. A post made of single lines separated by white space reads like a template and loses the connections between ideas.",
        ],
      },
      {
        type: "p",
        text: "One more thing to know: the blank lines count toward the 3,000 character limit and affect where the 'see more' fold falls. Too much white space near the top can push your second line below the fold.",
      },
      { type: "h2", text: "Lists" },
      {
        type: "p",
        text: "When a post contains steps, options or several examples, a list is easier to scan than a paragraph. LinkedIn has no list formatting, so write it by hand.",
      },
      {
        type: "list",
        items: [
          "Numbers work for steps and ranked items: 1., 2., 3. at the start of each line.",
          "A simple hyphen or a plain dot character works for items with no order.",
          "Keep list items short and parallel. If each starts with a verb, they all should.",
          "Three to five items is a comfortable length. Past seven, consider whether it is two posts.",
          "Introduce the list with a line that says what it is, so the reader knows why to read it.",
        ],
      },
      { type: "h2", text: "Why fancy bold and italic text causes problems" },
      {
        type: "p",
        text: "You have probably seen posts with bold or italic words, made with online 'text formatter' tools. Those tools do not add formatting. They swap your letters for lookalike characters from a Unicode block meant for mathematics. They look like bold letters, but to software they are different symbols.",
      },
      {
        type: "list",
        items: [
          "Screen readers may read them out letter by letter, or as their full technical names, or skip them. A reader who is blind or has low vision may hear nonsense where your key phrase should be.",
          "Search does not match them. A post with a bolded company or topic name will not show up when someone searches for that name, because the characters are not the same letters.",
          "Some devices and fonts show them as empty boxes or mismatched shapes.",
          "Copying the text into another app carries the odd characters with it.",
        ],
      },
      {
        type: "p",
        text: "If you use them at all, keep them to a short label of one or two words, such as a section marker, and never on a whole sentence, a name you want found in search, or anything important. Most posts read fine without any.",
      },
      { type: "h2", text: "Emoji as bullets" },
      {
        type: "p",
        text: "Some people use emoji at the start of each list item instead of a dash or a number. It can help a list stand out on a busy screen, and a check mark or arrow is quick to read. It also has costs.",
      },
      {
        type: "list",
        items: [
          "Screen readers announce each emoji by name, so a list of ten items becomes ten repetitions of 'right arrow'.",
          "A different emoji on every line adds noise without adding meaning.",
          "In a professional field, a feed full of emoji can read as less serious than the content deserves.",
        ],
      },
      {
        type: "p",
        text: "If you use them, pick one and use it consistently, or use numbers and dashes and let the words do the work.",
      },
      { type: "h2", text: "Mentions" },
      {
        type: "p",
        text: "To mention a person or company, type @ followed by their name and pick them from the list LinkedIn shows. The name becomes a link, and the person or page is usually notified.",
      },
      {
        type: "list",
        items: [
          "Mention people who are part of the story, such as a client who agreed to be named or a colleague who did the work.",
          "Ask before naming a client, especially with a number attached.",
          "Do not mention people to get their attention when they have nothing to do with the post. It reads as a request for reach, and they notice.",
          "Mentions work only if the name is picked from the list. Typing the name without selecting it leaves plain text.",
        ],
      },
      { type: "h2", text: "Where links go" },
      {
        type: "p",
        text: "You can put a link in the post, in the first comment, or leave it out and write the useful part in full. Each has tradeoffs, and LinkedIn does not publish how links affect a post's reach. If you do include one in the post, put it on its own line near the end, after the text has made its case, so it does not push your opening down.",
      },
      { type: "h2", text: "A before and after example" },
      {
        type: "p",
        text: "Before: one paragraph of eight sentences about how a design studio changed its proposal process, with the three changes buried in the middle, a bolded sentence made with a formatter, and five hashtags on the last line.",
      },
      {
        type: "p",
        text: "After: an opening line with the result, a line on why it matters, a short paragraph on the old process, a numbered list of the three changes with one line each, and a closing sentence on what to try first. No formatter bold, no wall of hashtags, the same facts. It takes about the same space and is much easier to read.",
      },
      { type: "h2", text: "A formatting checklist" },
      {
        type: "list",
        items: [
          "No paragraph longer than three sentences.",
          "A blank line between paragraphs, not between every sentence.",
          "Lists for steps and options, with short, parallel items.",
          "No formatter bold or italic on names, keywords or whole sentences.",
          "Emoji used sparingly and consistently, or not at all.",
          "Mentions only for people who belong in the post.",
          "Links placed after the point is made, or left out.",
          "Checked on a phone before posting.",
        ],
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials drafts posts with line breaks where they belong and keeps bold to short labels, converting it to LinkedIn's lookalike bold only at the moment of publishing so the stored text stays readable and searchable. Hashtags are left out unless your format principle asks for them.",
      },
      {
        type: "p",
        text: "If you want a different layout, such as numbered lists instead of paragraphs, write it in a revise comment. The card is rewritten and your format principle is updated, so later posts follow the same layout.",
      },
    ],
    related: [
      "/blog/links-in-linkedin-posts",
      "/blog/first-two-lines-of-a-linkedin-post",
      "/blog/linkedin-post-character-limit",
      "/blog/linkedin-hashtags",
    ],
  },
  {
    slug: "linkedin-hashtags",
    title: "How many hashtags to use on LinkedIn in 2026",
    description:
      "A few specific hashtags do no harm, a wall of them reads as spam, and a clear topic in your text does more than either. An honest guide for 2026.",
    date: "2026-09-27",
    readMinutes: 4,
    blocks: [
      {
        type: "p",
        text: "Use none to three hashtags on a LinkedIn post, and only specific ones that describe what the post is about. LinkedIn has played hashtags down over the years, and a line of ten tags at the end of a post now reads more like spam than strategy. A clear topic in the text itself does more for the right readers than any tag.",
      },
      {
        type: "p",
        text: "You will find confident advice elsewhere with exact numbers attached. LinkedIn does not publish how hashtags affect ranking, so treat any precise figure as a guess. Here is what can be said honestly, and how to decide for your own posts.",
      },
      { type: "h2", text: "What LinkedIn has changed about hashtags" },
      {
        type: "p",
        text: "A few years ago, hashtags had a bigger role on LinkedIn. Members could follow a hashtag and see posts using it in their feed, and hashtag pages were promoted in several places. Since then LinkedIn has scaled that back, including removing followable hashtags from the feed experience. Hashtags in a post still work as links to search results, but they are no longer a main way people find content.",
      },
      {
        type: "p",
        text: "LinkedIn has said, in general terms, that it tries to understand what a post is about from its content. It has not said how much weight a hashtag carries in that. What you can observe is that posts from the people you remember in your feed rarely depend on tags.",
      },
      { type: "h2", text: "How many hashtags should you use" },
      {
        type: "list",
        items: [
          "Zero is fine. Many strong posts use none, and nobody notices the absence.",
          "One to three specific tags is harmless and can help a reader who clicks one find related posts.",
          "Beyond that, each extra tag adds clutter and makes the post look like it was written for reach rather than for readers.",
        ],
      },
      {
        type: "p",
        text: "There is no evidence that a particular count, three or five or any other, earns more reach. If someone quotes a percentage uplift for a specific number of hashtags, ask where it came from.",
      },
      { type: "h2", text: "Which hashtags to pick" },
      {
        type: "p",
        text: "If you use tags, make them specific to the subject of the post, and use words your readers would search for.",
      },
      {
        type: "list",
        items: [
          "Specific beats broad. A tag for the exact field, such as a type of accounting or a named method, describes the post. A tag like #business or #success describes every post.",
          "Match the post. A tag about hiring on a post about pricing misleads the reader who clicked it.",
          "Use the form people use. Check the tag in LinkedIn search and pick the spelling that already has posts behind it.",
          "Write multiword tags with capitals at the start of each word, such as #ProductPricing, so screen readers can read them as words.",
          "Keep a short, consistent set for your field instead of new tags every post.",
        ],
      },
      { type: "h2", text: "Where to put hashtags" },
      {
        type: "p",
        text: "Put them at the end of the post, on their own line, or leave them out. Hashtags in the middle of sentences make the text harder to read and turn words into links that pull the reader away. A hashtag in the opening line takes space from the only part of the post everyone sees.",
      },
      { type: "h2", text: "Why a wall of hashtags hurts" },
      {
        type: "list",
        items: [
          "It reads as spam. Readers have seen the pattern on posts written for reach, and they judge the post by it.",
          "It adds length and noise at the point where a good post should end cleanly.",
          "It suggests the author is not sure what the post is about, which undercuts the post itself.",
          "Screen readers read every tag aloud, so ten tags is a long list for someone listening.",
        ],
      },
      { type: "h2", text: "What does more than hashtags" },
      {
        type: "p",
        text: "If the goal is to reach people who care about your subject, make the subject obvious in the words of the post. Name the field, the problem, the tool or the kind of customer. A post that opens with 'A three person bookkeeping firm cut month-end close from ten days to four' tells both readers and LinkedIn what it is about more clearly than #accounting ever could.",
      },
      {
        type: "steps",
        items: [
          "Decide who the post is for before you write it.",
          "Use the words that person would use to describe their own problem.",
          "Name the specific situation in the first two lines.",
          "Stay on a small set of topics over months, so your name becomes linked with them.",
          "Add one to three tags at the end only if they describe the post precisely.",
        ],
      },
      {
        type: "p",
        text: "The fourth step matters most. People follow and remember authors who keep writing about the same few things. That consistency does the job hashtags were supposed to do.",
      },
      { type: "h2", text: "Test it on your own posts" },
      {
        type: "p",
        text: "Since the ranking is not public, your own results are the best evidence you have. Over a couple of months, post similar content with and without a few tags and compare comments and profile visits as well as reach. Look at several posts of each kind before deciding, and keep the topic and posting time the same so the tags are the main difference. One post proves nothing.",
      },
      { type: "h2", text: "How GoodSocials handles this" },
      {
        type: "p",
        text: "GoodSocials leaves hashtags out of drafts unless your format principle asks for them. If you want two tags at the end of every post, say so once in a revise comment and it becomes part of the format principle for every future draft.",
      },
      {
        type: "p",
        text: "What keeps a feed on topic is its four themes. Each profile has four, written from your site at onboarding and editable after, and new ideas are dealt across them so your posts stay on the subjects you want to be known for.",
      },
    ],
    related: [
      "/blog/content-themes-for-linkedin",
      "/blog/how-to-format-linkedin-posts",
      "/blog/how-to-write-a-linkedin-post",
      "/blog/what-to-measure-on-linkedin",
    ],
  },
];
