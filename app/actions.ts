"use server";

import { signOut } from "@/auth";

/**
 * Ending the session, from the one control in the app that offers it.
 *
 * Lands on the landing page rather than /signin. A member who just signed out
 * and is dropped on a LinkedIn button is one click from being signed back in,
 * which reads as a sign out that did not take.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
