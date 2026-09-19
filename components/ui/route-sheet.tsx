"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";

/**
 * A sheet whose open state is the URL, for a route intercepted over the board.
 * Closing is a back navigation, so Escape, the Close button, the backdrop, and
 * the browser's own back button all do the same thing.
 */
export function RouteSheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Sheet title={title} onClose={() => router.back()}>
      {children}
    </Sheet>
  );
}
