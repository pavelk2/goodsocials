"use client";

import { useEffect, useRef } from "react";
import { topUp } from "@/app/board/actions";

/**
 * Drafting the top of the queue without being asked. A board of seven ideas is
 * seven things to click; a board with posts already written is something to
 * read and approve, which is the product.
 *
 * It runs once per mount and the server caps how many drafts one call writes,
 * so a user refreshing the page cannot spend money in a loop. The ref guards
 * the double invoke that Strict Mode does in development.
 */
export function TopUp({ needed }: { needed: boolean }) {
  const started = useRef(false);

  useEffect(() => {
    if (!needed || started.current) return;
    started.current = true;
    void topUp();
  }, [needed]);

  return null;
}
