"use client";

import { useEffect } from "react";
import { trackLanding } from "@/app/actions";

/** One landing_viewed event per page load, with where the reader came from. */
export function TrackLanding() {
  useEffect(() => {
    void trackLanding(document.referrer, window.location.search);
  }, []);
  return null;
}
