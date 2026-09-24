import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CrispChat } from "@/components/crisp-chat";
import "./globals.css";

// The hero sets one clause in italic, so the real italic face ships. Without
// it the browser slants the roman, which at hero size reads as a rendering
// fault rather than a typographic choice.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoodSocials",
  description:
    "AI social media manager for LinkedIn. Writes high quality content, you approve it in a kanban board, it schedules so you post regularly, close to daily.",
};

/**
 * The `@modal` slot holds the legal sheets. Privacy and terms are linked from
 * a footer that sits on the landing page, the sign in page and every screen
 * behind them, so the slot has to be at the root to intercept a click from any
 * of them. Everything else renders nothing into it.
 */
export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
        <CrispChat />
      </body>
    </html>
  );
}
