/**
 * Three reactions parked in the white space beside the opening claim.
 *
 * They were in the hero until the hero became a screen of footage. DESIGN.md
 * section 8: a white chip over moving water is a sticker, and the first screen
 * now holds one idea and one button. The claim under it is ragged left and
 * leaves the right half of the line empty, which is the shape they were drawn
 * for in the first place. Static: no float, no drift, no
 * hover. DESIGN.md section 5 bans animation that is there to be noticed, and a
 * reaction that moves is a reaction that is performing.
 *
 * They carry no counts. The dashboard rule in CLAUDE.md is that we sell cadence
 * and never followers or impressions, and a number under a thumb on the hero is
 * an impression count with a costume on. The glyph alone says what the posts are
 * for.
 *
 * System emoji, not drawn glyphs. The first pass drew all three as ink paths so
 * they would be the same shape on every machine; Pavel's read was that the
 * result looked like icons rather than reactions. It does, and a reaction is
 * the one thing on a page a reader already knows the shape of, so the platform
 * gets to draw it: Apple Color Emoji on a Mac, Segoe on Windows, Noto on the
 * rest. Yellow thumb, red heart, yellow laugh, and the accent is untouched
 * because none of that colour is ours to spend.
 *
 * The white chip stays. It is what makes them read as reactions on a post
 * rather than as three emoji somebody left on the page, and it keeps them
 * legible where the hero meets the plum wash below.
 */
const CHIPS = [
  {
    key: "thumb",
    glyph: "👍",
    label: "Like",
    className: "right-[196px] top-[92px] rotate-[-8deg]",
    size: 64,
  },
  {
    key: "heart",
    /* With the variation selector. Without it some platforms render the older
       black heart glyph instead of the red emoji. */
    glyph: "❤️",
    label: "Love",
    className: "right-[20px] top-[160px] rotate-[10deg]",
    size: 70,
  },
  {
    key: "laugh",
    glyph: "😂",
    label: "Funny",
    className: "right-[128px] top-[276px] rotate-[-6deg]",
    size: 62,
  },
];

export function Reactions() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden lg:block"
      aria-hidden="true"
    >
      {CHIPS.map(({ key, glyph, label, className, size }) => (
        <span
          key={key}
          title={label}
          style={{
            width: size,
            height: size,
            /* Emoji sit high in their em box, so a line-height of 1 and the
               flex centring together are what actually put one in the middle
               of a circle. */
            fontSize: size * 0.54,
            lineHeight: 1,
          }}
          className={`card-lift absolute flex items-center justify-center rounded-full ${className}`}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}
