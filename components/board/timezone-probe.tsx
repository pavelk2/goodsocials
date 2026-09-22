"use client";

import { useEffect, useRef } from "react";
import { saveDetectedTimezone } from "@/app/board/actions";

/**
 * Asks the browser what zone this person is in, once, and only when the board
 * has never been told.
 *
 * Every slot is 09:00 somewhere, and until this runs that somewhere is UTC,
 * which is 01:00 in California. Asking in a form would be one more question
 * between a stranger and their first approved post, and the browser already
 * knows the answer. Settings is where it is corrected, which matters for an
 * agency in Amsterdam running a client in New York: the detected zone is the
 * operator's, not the client's, and only a person can tell those apart.
 *
 * Writes nothing when a zone is already stored, so a second browser in a
 * second country cannot quietly reschedule somebody's month.
 */
export function TimezoneProbe({ known }: { known: boolean }) {
  const asked = useRef(false);

  useEffect(() => {
    if (known || asked.current) return;
    asked.current = true;

    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return;
    // Nothing on screen depends on the answer landing, and the next render
    // picks it up. A failure here leaves the board on UTC and settings still
    // says so, which is the honest fallback.
    void saveDetectedTimezone(zone);
  }, [known]);

  return null;
}
