"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A landing page section that shows its `.rv` children once it scrolls into
 * view, each at the delay its `rv-N` class sets in `app/globals.css`. The
 * title carries no number, so it lands first and the rest follows it.
 *
 * Fires once. The observer's bottom margin starts it a little before the
 * section is fully on screen, so a reader scrolling at speed never meets an
 * empty band.
 */
export function Reveal({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.in = "";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className} data-reveal="">
      {children}
    </section>
  );
}
