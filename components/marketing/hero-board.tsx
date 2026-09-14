import { BoardShell } from "@/components/board/board";
import { Card } from "@/components/board/card";
import { Column } from "@/components/board/column";
import { Principle, Principles } from "@/components/board/principles";
import { FocusDraftOnPhone } from "./focus-draft";

import "./hero-board.css";

/**
 * The hero. DESIGN.md section 2: the real board at real fidelity, with the
 * principles rail in frame and a card mid-revision whose comment is visibly
 * about one of the principles. Built from the real board components rather
 * than a screenshot, so it cannot drift away from the product.
 *
 * The post text is written, not generated, and no number on this board is
 * invented: there are no metrics on it at all, because we sell cadence.
 */
export function HeroBoard() {
  return (
    <div className="hb-frame">
      <BoardShell
        className="hb"
        principles={
          <Principles>
            <Principle kind="voice">
              <span className="hb-swap">
                <span className="hb-fix-before" aria-hidden="true">
                  Direct, first person, one idea per post. Short sentences.
                </span>
                <span className="hb-fix-after">
                  Direct, first person, one idea per post. Short sentences, no
                  exclamation marks.
                </span>
              </span>
            </Principle>
            <Principle kind="visual">
              Photos from the desk, never stock. One subject, no text on the
              image.
            </Principle>
            <Principle kind="format">
              Under 120 words. No hashtags. A line break between thoughts.
            </Principle>
          </Principles>
        }
      >
        <Column state="idea">
          <Card text="Why we stopped doing weekly demos" />
          <Card text="The pricing change nobody complained about" />
          <Card text="What our first ten customers had in common" />
        </Column>

        <Column state="draft">
          <Card
            active
            text={
              <span className="hb-swap">
                <span className="hb-fix-before" aria-hidden="true">
                  We killed the onboarding checklist last month and signups went
                  up 14 percent! Four of the five steps were us asking for data
                  we could read later!
                </span>
                <span className="hb-fix-after">
                  We killed the onboarding checklist last month and signups went
                  up 14 percent. Four of the five steps were us asking for data
                  we could read later.
                </span>
              </span>
            }
            comment={
              <>
                <span className="hb-type hb-type-1" aria-hidden="true">
                  Too many exclamation marks.
                </span>
                <span className="hb-type hb-type-2" aria-hidden="true">
                  I do not write like that.
                </span>
                <span className="sr-only">
                  Comment: too many exclamation marks. I do not write like that.
                </span>
              </>
            }
          />
          <Card
            text={
              <span className="hb-swap">
                <span className="hb-carry-before" aria-hidden="true">
                  Three years in and I still get nervous before a demo! Here is
                  what I do in the ten minutes before one!
                </span>
                <span className="hb-carry-after">
                  Three years in and I still get nervous before a demo. Here is
                  what I do in the ten minutes before one.
                </span>
              </span>
            }
          />
        </Column>

        <Column state="image">
          <Card
            text="The five questions every new customer asks in week one"
            meta="Image queued"
          />
        </Column>

        <Column state="scheduled">
          <Card
            text="Our support inbox is one person and a spreadsheet. Here is why we have not fixed that."
            meta="Tue 09:00"
          />
          <Card
            text="I turned down a 40k contract in June. Best call of the year."
            meta="Wed 09:00"
          />
          <Card
            text="Hiring note: we read the cover letter first."
            meta="Thu 08:30"
          />
        </Column>

        <Column state="posted">
          <Card
            text="Six months of shipping on Fridays. What broke and what did not."
            meta="Posted Mon 09:00"
          />
          <Card
            text="The demo I gave 60 times, in four slides."
            meta="Posted Fri 09:00"
          />
        </Column>
      </BoardShell>
      <FocusDraftOnPhone />
    </div>
  );
}
