"use client";

import { useState } from "react";
import { PostText } from "@/components/post-text";

/**
 * The sample post the way it will sit in a feed: author, text cut at the fold
 * with the same "more" a reader would press, then the picture. The fold is
 * where LinkedIn cuts a post in the feed, near 210 characters or three lines,
 * so the member sees what their followers see before deciding.
 *
 * No platform logo and no invented reaction counts. The frame is familiar
 * because the layout is; the numbers under a post are the one thing we would
 * have to make up.
 */
const FOLD = 210;

export function PostPreview({
  name,
  avatarUrl,
  text,
  imageUrl,
  imageAlt,
}: {
  name: string;
  avatarUrl: string | null;
  text: string;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const folded = !open && text.length > FOLD;
  const shown = folded ? cut(text) : text;

  return (
    <article className="card-lift overflow-hidden rounded-[var(--r-lg)] bg-surface">
      <header className="flex items-center gap-3 px-5 pt-5">
        {avatarUrl ? (
          // The member's own LinkedIn picture, from the host LinkedIn serves it on.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-paper font-semibold text-ink-2">
            {name.slice(0, 1)}
          </span>
        )}
        <span>
          <span className="block font-semibold leading-tight">{name}</span>
          <span className="block text-[13px] text-ink-2">Tomorrow, 09:00</span>
        </span>
      </header>

      <div className="whitespace-pre-line px-5 pb-4 pt-3 text-[15px] leading-[1.45]">
        <PostText text={shown} />
        {folded ? (
          <>
            {"… "}
            <button type="button" onClick={() => setOpen(true)} className="text-ink-2">
              more
            </button>
          </>
        ) : null}
      </div>

      {imageUrl ? (
        // A Vercel Blob URL written by the image step, one per post.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={imageAlt ?? ""} className="block aspect-[4/3] w-full object-cover" />
      ) : null}

      <footer className="flex justify-between border-t border-hairline px-5 py-3 text-[13px] text-ink-2">
        <span>Like</span>
        <span>Comment</span>
        <span>Repost</span>
        <span>Send</span>
      </footer>
    </article>
  );
}

/** Cut at the last word boundary before the fold, never mid-word. */
function cut(text: string): string {
  const slice = text.slice(0, FOLD);
  const space = slice.lastIndexOf(" ");
  return (space > FOLD * 0.6 ? slice.slice(0, space) : slice).trimEnd();
}
