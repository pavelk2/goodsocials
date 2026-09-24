"use client";

import { useEffect } from "react";
import { trackView } from "@/app/onboarding/actions";

/** Sends one "this screen was shown" event, for screens rendered on the server. */
export function TrackView({ step }: { step: string }) {
  useEffect(() => {
    void trackView(step);
  }, [step]);
  return null;
}
