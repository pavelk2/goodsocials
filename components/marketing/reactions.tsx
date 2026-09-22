/**
 * Three reactions parked around the hero. Static: no float, no drift, no
 * hover. DESIGN.md section 5 bans animation that is there to be noticed, and a
 * reaction that moves is a reaction that is performing.
 *
 * They carry no counts. The dashboard rule in CLAUDE.md is that we sell cadence
 * and never followers or impressions, and a number under a thumb on the hero is
 * an impression count with a costume on. The glyph alone says what the posts are
 * for.
 *
 * Drawn rather than set in emoji, because an emoji is a different typeface on
 * every operating system and three of them side by side is three house styles.
 * Ink on a white chip, so they sit in the page's two greys and spend none of
 * the accent.
 */

function Thumb() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
    </svg>
  );
}

function Heart() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function Laugh() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Eyes shut, which is the difference between a smile and a laugh. */}
      <path
        d="M6.6 10.2c.7-.9 1.5-1.4 2.3-1.4s1.6.5 2.3 1.4M12.8 10.2c.7-.9 1.5-1.4 2.3-1.4s1.6.5 2.3 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.4 13.4h11.2c0 3-2.5 5.2-5.6 5.2s-5.6-2.2-5.6-5.2z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Each chip is placed against the wrap's own edge and tilted a few degrees, so
 * they read as things dropped onto the page rather than as a row of icons
 * somebody laid out. Hidden below lg: on a narrow window there is no margin to
 * park them in, and over the headline they are litter.
 */
const CHIPS = [
  {
    key: "thumb",
    Glyph: Thumb,
    label: "Like",
    className: "left-0 top-[148px] rotate-[-8deg] xl:left-[22px]",
    size: 64,
    /* The face needs more of its chip than the thumb or the heart do, or the
       eyes and the mouth close up into one grey blob. */
    ratio: 0.42,
  },
  {
    key: "heart",
    Glyph: Heart,
    label: "Love",
    className: "right-0 top-[92px] rotate-[10deg] xl:right-[16px]",
    size: 70,
    ratio: 0.42,
  },
  {
    key: "laugh",
    Glyph: Laugh,
    label: "Funny",
    className: "right-[108px] top-[402px] rotate-[-6deg] xl:right-[150px]",
    size: 62,
    ratio: 0.56,
  },
];

export function Reactions() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden lg:block"
      aria-hidden="true"
    >
      {CHIPS.map(({ key, Glyph, label, className, size, ratio }) => (
        <span
          key={key}
          title={label}
          style={{ width: size, height: size }}
          className={`card-lift absolute flex items-center justify-center rounded-full text-ink ${className}`}
        >
          <span style={{ width: size * ratio, height: size * ratio }}>
            <Glyph />
          </span>
        </span>
      ))}
    </div>
  );
}
