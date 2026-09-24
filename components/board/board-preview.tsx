import { CardShell, CardComment } from "./card-shell";

/**
 * The landing page hero. Not a mockup and not a screenshot: the real Card
 * component and the real column shell, rendered with an example board.
 *
 * DESIGN.md section 2 asks this still to carry the whole pitch, so the Voice
 * principle is in frame, one card is mid-revision, and the comment on it is
 * visibly about that principle. A reader should see that the correction goes
 * there, and that there applies to everything after.
 *
 * The frame is a window: surface white on the paper ground, one shadow because
 * it genuinely floats, paper inside because that is the board's own ground.
 * It replaces a photograph once there is a real board worth photographing.
 *
 * The LinkedIn mark sits on the top corner of the frame, tilted 15 degrees like
 * a sticker somebody put there. It is the one place the board says where these
 * posts end up, and it says it without a caption. The tilt is static: no
 * animation, no straightening on hover, and it is not a link.
 *
 * The offsets are the tightest that clear two things. Rotation grows the box to
 * about 69px across, so at 16px out the mark still ends inside the section's
 * 24px gutter on a phone, and it clears the runway line inside the frame.
 */

const VOICE =
  "Reports, does not sell. Short sentences, plain words. Every number comes from our own data and says so.";

const COLUMNS: {
  name: string;
  count: number;
  cards: {
    body: string;
    label: string;
    scheduledAt?: Date;
    comment?: string;
  }[];
}[] = [
  {
    name: "Idea",
    count: 4,
    cards: [
      {
        body: "We cut one line from our job ad. The line asked for ten years of experience.",
        label: "Finding. How we hire",
      },
      {
        body: "Our cheapest new customers came from answering support tickets in public.",
        label: "Receipt. What growth costs us",
      },
    ],
  },
  {
    name: "Draft",
    count: 2,
    cards: [
      {
        body: "Ever wondered why hiring is slow? Let's dive into the key factors that make all the difference.",
        label: "Framework. How we hire",
        comment: "Opens with a question and says nothing. Lead with the number.",
      },
    ],
  },
  {
    name: "Scheduled",
    count: 6,
    cards: [
      {
        body: "Three years of invoices in one spreadsheet. Our pricing was wrong for one customer size.",
        label: "Receipt. What we charge and why",
        scheduledAt: new Date(Date.UTC(2026, 8, 15, 8, 30)),
      },
      {
        body: "The support ticket that changed our roadmap was eleven words long.",
        label: "Finding. What customers ask us for",
        scheduledAt: new Date(Date.UTC(2026, 8, 16, 8, 30)),
      },
    ],
  },
  {
    name: "Posted",
    count: 31,
    cards: [
      {
        body: "We stopped our weekly all-hands. Nobody has asked for it back.",
        label: "Finding. How we run the company",
        scheduledAt: new Date(Date.UTC(2026, 8, 12, 8, 30)),
      },
    ],
  },
];

/** The LinkedIn glyph, Font Awesome's linkedin-in outline. No enclosing tile,
 *  because the badge around it is already the tile. */
function LinkedInMark() {
  return (
    <svg
      viewBox="0 0 448 512"
      fill="currentColor"
      aria-hidden="true"
      className="h-[22px] w-[22px]"
    >
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

export function BoardPreview() {
  return (
    <div
      className="relative rounded-[28px] border border-hairline bg-surface p-5 sm:p-7"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div
        role="img"
        aria-label="Posts to LinkedIn"
        className="absolute -right-4 -top-4 z-10 flex h-14 w-14 rotate-[15deg] items-center justify-center rounded-[18px] border border-hairline bg-surface text-[#0a66c2] sm:-right-5 sm:-top-5"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <LinkedInMark />
      </div>

      {/* Right padding reserves the corner the mark now occupies. Without it
          the mark sits on top of the runway figure, worst on a phone where the
          frame is narrow and the figure ends near the edge. */}
      <div className="flex items-baseline justify-between pr-8 sm:pr-4">
        <p className="text-[13px] font-medium text-ink-2">Brand principles</p>
        <p className="text-[13px] text-ink-2">
          Runway <span className="num font-medium text-accent-text">9 days</span>
        </p>
      </div>

      <p className="mt-3 max-w-[620px] text-[15px] leading-[1.4]">
        <span className="text-ink-2">Voice. </span>
        {VOICE}
      </p>

      <div className="relative mt-6 rounded-[20px] bg-paper p-4">
        <div className="flex snap-x gap-4 overflow-x-auto sm:overflow-hidden">
          {COLUMNS.map((column) => (
            <section key={column.name} className="w-[320px] shrink-0 snap-start">
              <header className="flex h-[44px] items-center justify-between px-1">
                <h3 className="text-[13px] font-medium text-ink-2">
                  {column.name}
                </h3>
                <span className="num text-[13px] font-medium text-ink-3">
                  {column.count}
                </span>
              </header>
              <div className="flex min-h-[200px] flex-col gap-2">
                {column.cards.map((card) => (
                  <CardShell
                    key={card.body}
                    body={card.body}
                    label={card.label}
                    scheduledAt={card.scheduledAt}
                  >
                    {card.comment ? <CardComment comment={card.comment} /> : null}
                  </CardShell>
                ))}
              </div>
            </section>
          ))}
        </div>
        {/* The board continues off the edge, as a real one does. Fading it is
            the difference between "continues" and "rendered wrong".
            Not on a phone: there the fade lands on top of the first card's own
            text, which reads as broken. A phone swipes the board instead, which
            is what the real board does too. */}
        <div className="pointer-events-none absolute inset-y-4 right-4 hidden w-32 bg-gradient-to-l from-paper to-transparent sm:block" />
      </div>
    </div>
  );
}
