"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { RefTag, SourceTag } from "@/components/marketing/data-sources";
import type { SourceKind } from "@/lib/integrations/types";

/**
 * The "What it writes" card as a carousel, one post per kind, on Kobra's
 * carousel. The row of kind names under the pair is its control: the name of
 * the post on screen is the pressed one, and pressing another turns to it. A
 * reader who wants to know what a deep dive looks like reads one instead of
 * a label.
 *
 * Every example is TimeTuna's, written the way the agent is meant to write:
 * third person, a sample size and a caveat on every claim, no absolutes. The
 * figures are illustrative until TimeTuna's own replace them, same as the rest
 * of the page. `lib/agent/ideas.ts` is where the real mix is set.
 */
type Kind = {
  name: string;
  post: string;
  basis: { source: SourceKind } | { ref: string };
  lead: string;
};

export const KINDS: Kind[] = [
  {
    name: "Your numbers",
    post: "TimeTuna reschedules fell from 18% in May to 7% in August. One change in between: the invite shows the guest's timezone first. n = 9,412 meetings. Seasonality could explain part of it, so a holdout runs in October.",
    basis: { source: "posthog" },
    lead: "Your numbers, read from",
  },
  {
    name: "Market research",
    post: "Of 214 booking pages read in September, 138 ask for a phone number before the guest picks a time. Research on form length says each extra field costs completions, though none of it measured booking pages, so TimeTuna is testing the claim on its own.",
    basis: { ref: "214 booking pages" },
    lead: "Research, read from",
  },
  {
    name: "Deep dive",
    post: "A meeting invite passes four clocks: the host's calendar, the guest's, the email client and the server that sends it. TimeTuna traced 312 wrong-time bookings. 71% broke in the email client, which drew the time in the sender's zone. One quarter of data.",
    basis: { ref: "RFC 5545, iCalendar" },
    lead: "A deep dive into",
  },
];

type Shared = { api: CarouselApi | undefined; setApi: (api: CarouselApi) => void; at: number };

const Ctx = createContext<Shared | null>(null);

function useKinds() {
  const shared = useContext(Ctx);
  if (!shared) throw new Error("PostKinds parts need <PostKinds>");
  return shared;
}

/** Holds the carousel's api, so the card and the row under it share a slide. */
export function PostKinds({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<CarouselApi>();
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setAt(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return <Ctx.Provider value={{ api, setApi, at }}>{children}</Ctx.Provider>;
}

/** The right half of the contrast: the posts this writes, one kind a slide. */
export function PostKindsCard() {
  const { setApi } = useKinds();

  return (
    <div className="rv rv-3 card-lift flex flex-col rounded-[var(--r-xl)] p-6">
      <p className="font-mono text-[12px] text-ink-2">
        <span aria-hidden="true">✓ </span>What it writes
      </p>
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        aria-label="Posts it writes, one of each kind"
        className="mt-5 flex grow flex-col rounded-[var(--r-md)] [&>[data-slot=carousel-content]]:grow"
      >
        <CarouselContent className="h-full">
          {KINDS.map((kind, i) => (
            <CarouselItem
              key={kind.name}
              aria-label={`${i + 1} of ${KINDS.length}: ${kind.name}`}
              className="flex flex-col"
            >
              <p className="grow text-[17px] leading-[1.5] tracking-[-0.01em]">
                {kind.post}
              </p>
              <p className="mt-6 flex flex-wrap items-center gap-[6px] border-t border-hairline pt-4 font-mono text-[11.5px] text-ink-2">
                {kind.lead}{" "}
                {"source" in kind.basis ? (
                  <SourceTag kind={kind.basis.source} />
                ) : (
                  <RefTag label={kind.basis.ref} />
                )}
              </p>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

/** The kind names, as the carousel's control. */
export function PostKindsRow() {
  const { api, at } = useKinds();

  return (
    <div className="rv rv-4 mt-8 flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 font-mono text-[12px] text-ink-2">
        Every post is one of three kinds:
      </span>
      {KINDS.map((kind, i) => (
        <button
          key={kind.name}
          type="button"
          aria-pressed={at === i}
          onClick={() => api?.scrollTo(i)}
          className={`rounded-full border px-3 py-[5px] text-[13px] transition-colors ${
            at === i
              ? "border-ink bg-ink text-paper"
              : "border-hairline bg-surface"
          }`}
        >
          {kind.name}
        </button>
      ))}
    </div>
  );
}
