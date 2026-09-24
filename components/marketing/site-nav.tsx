"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { DEFAULT_PLAN, TRIAL_DAYS, planHref } from "@/lib/plans";

/**
 * Mark left, the sections in the middle, two controls right.
 *
 * The first pass at this bar put the links next to the mark on the argument
 * that a centred set is the shape of every funded SaaS page. That was true and
 * it was not a reason. A reader scanning a bar for where to go finds the links
 * faster in the middle, the mark keeps the corner it has on every other
 * surface, and the two controls on the right are the only thing on the page
 * that follows the reader down it. DESIGN.md section 6.
 *
 * Sign in is an outlined pill rather than a bare link. On the reference page
 * the pair reads as one control with two ends, and a text link beside a filled
 * button reads as an afterthought.
 *
 * With `signedIn` the pair collapses to one pill. There is nothing to sign in
 * to twice and no trial left to start, so the bar carries the one thing a
 * member who landed here by accident wants, which is the way back to the board.
 *
 * With `overlay` the bar has no ground of its own until the reader leaves the
 * hero. DESIGN.md section 8: a bar with a paper fill across the top of the
 * footage would cut the frame in half and turn a full screen of video into a
 * banner.
 */
const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it is for" },
  { href: "#pricing", label: "Pricing" },
  { href: "#permissions", label: "LinkedIn" },
];

export function SiteNav({
  overlay = false,
  signedIn = false,
}: {
  overlay?: boolean;
  signedIn?: boolean;
}) {
  /* Over footage until the hero is behind us, then the bar the rest of the
     site has. Starting at true when there is no overlay keeps every other page
     server-rendered in its final state. */
  const [landed, setLanded] = useState(!overlay);

  useEffect(() => {
    if (!overlay) return;

    const onScroll = () => {
      setLanded(window.scrollY > window.innerHeight - 120);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const onFootage = overlay && !landed;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color] duration-300 ${
        onFootage
          ? "border-b border-transparent"
          : "border-b border-hairline bg-paper/80 backdrop-blur-[12px]"
      }`}
      style={onFootage ? { color: "#ffffff" } : undefined}
    >
      <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1160px] items-center gap-6 px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
        >
          {onFootage ? <Logo tile="#ffffff" cell="#0c0c0d" /> : <Logo />}
          GoodSocials
        </Link>

        {/* Centred on the bar rather than on the space left over, so the link
            set does not drift when the two buttons change width. */}
        <ul
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[15px] lg:flex ${
            onFootage ? "" : "text-ink-2"
          }`}
          style={onFootage ? { color: "rgba(255, 255, 255, 0.78)" } : undefined}
        >
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={onFootage ? "nav-link-video" : "nav-link"}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {signedIn ? null : (
            <Link
              href="/signin"
              className={`pill btn-outline hidden whitespace-nowrap border px-[18px] py-[9px] text-[15px] sm:block ${
                onFootage ? "" : "border-hairline bg-surface"
              }`}
              style={
                onFootage
                  ? {
                      borderColor: "rgba(255, 255, 255, 0.38)",
                      color: "#ffffff",
                    }
                  : undefined
              }
            >
              Sign in
            </Link>
          )}
          {/* The header's button starts the flow. It does not quote a price:
              the hero states one a screen further down and the pricing section
              states all three, and a number in a sticky bar that follows the
              reader the whole way is a nag rather than an offer. What it does
              say is that the first week costs nothing, which is the only fact
              that makes pressing it easy. Signed in, both of those facts are
              spent, and the button names the destination instead. */}
          <Link
            href={planHref(DEFAULT_PLAN.slug, signedIn)}
            className="pill btn-accent num whitespace-nowrap px-[18px] py-[9px] text-[15px]"
          >
            {signedIn ? "Open board" : `Start ${TRIAL_DAYS} days free`}
          </Link>
        </div>
      </nav>
    </header>
  );
}
