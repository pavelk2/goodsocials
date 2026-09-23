"use client";

import { useEffect, useRef } from "react";

/**
 * The footage behind the hero. DESIGN.md section 8.
 *
 * The poster frame is the video's own first frame, 86KB, and the element
 * paints it while the 7MB behind it arrives. So the hero is never a black
 * rectangle, and a reader on a slow connection gets a photograph rather than a
 * wait. When the video starts it starts on that same frame.
 *
 * A reader who has asked the system for reduced motion gets that frame and
 * nothing else. CSS cannot pause a video, so this is the only honest way to
 * respect the setting, and it is why the component is a client one at all.
 */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      const element = video.current;
      if (!element) return;

      if (query.matches) {
        element.pause();
        element.currentTime = 0;
      } else {
        void element.play().catch(() => {
          /* A browser that refuses to autoplay leaves the poster up, which is
             the same picture standing still. Nothing to recover from. */
        });
      }
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#0b1416]">
      <video
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/paddle-out.jpg"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero/paddle-out.mp4" type="video/mp4" />
      </video>

      {/* The scrim. Two layers doing two jobs: a flat wash that holds the
          contrast of white type anywhere on the frame, and a gradient that is
          heaviest at the bar and at the bottom edge, which are the two places
          type has to survive whatever the water is doing. */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(8, 14, 16, 0.40)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,10,12,0.56) 0%, rgba(6,10,12,0.10) 42%, rgba(6,10,12,0.60) 100%)",
        }}
      />
    </div>
  );
}
