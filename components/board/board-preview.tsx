import { Card } from "./card";

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
 */

const VOICE =
  "Short declarative sentences. Willing to name a number. Never opens with a question.";

const COLUMNS: {
  name: string;
  count: number;
  cards: { body: string; scheduledAt?: Date; comment?: string }[];
}[] = [
  {
    name: "Idea",
    count: 4,
    cards: [
      {
        body: "We rejected 40 candidates before changing the job description. The change was removing the years-of-experience line.",
      },
      {
        body: "Our cheapest acquisition channel last quarter was answering support tickets in public.",
      },
    ],
  },
  {
    name: "Draft",
    count: 2,
    cards: [
      {
        body: "Ever wondered why your hiring pipeline is slow? Let's dive into the three key factors that make all the difference.",
        comment: "Opens with a question and says nothing. Lead with the number.",
      },
    ],
  },
  {
    name: "Scheduled",
    count: 6,
    cards: [
      {
        body: "Three years of invoices in one spreadsheet taught me our pricing was wrong for exactly one customer size.",
        scheduledAt: new Date(Date.UTC(2026, 8, 15, 8, 30)),
      },
      {
        body: "The support ticket that changed our roadmap was 11 words long.",
        scheduledAt: new Date(Date.UTC(2026, 8, 16, 8, 30)),
      },
    ],
  },
  {
    name: "Posted",
    count: 31,
    cards: [
      {
        body: "We stopped running a weekly all-hands. Nobody has asked for it back.",
        scheduledAt: new Date(Date.UTC(2026, 8, 12, 8, 30)),
      },
    ],
  },
];

export function BoardPreview() {
  return (
    <div
      className="rounded-[28px] border border-hairline bg-surface p-5 sm:p-7"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-ink-2">Brand principles</p>
        <p className="text-[13px] text-ink-2">
          Runway <span className="num font-medium text-accent">9 days</span>
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
                  <Card key={card.body} {...card} />
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
