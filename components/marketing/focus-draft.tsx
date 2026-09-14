"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A phone shows one column at a time, and the column worth showing first is
 * the one being revised: without it the principle rewrites itself for no
 * visible reason. Desktop already has the card and the rail in one frame, so
 * this does nothing there.
 *
 * Runs before paint and sets scrollLeft directly, so there is no visible jump.
 */
export function FocusDraftOnPhone() {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = marker.current;
    if (!node || window.innerWidth > 640) return;

    const frame = node.closest(".hb-frame");
    const scroller = frame?.querySelector(".board");
    const column = frame?.querySelector('[data-state="draft"]');
    if (!(scroller instanceof HTMLElement) || !(column instanceof HTMLElement))
      return;

    scroller.scrollLeft =
      column.getBoundingClientRect().left -
      scroller.getBoundingClientRect().left +
      scroller.scrollLeft;
  }, []);

  return <span ref={marker} hidden />;
}
