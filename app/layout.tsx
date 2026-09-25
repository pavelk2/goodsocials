import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { CrispChat } from "@/components/crisp-chat";
import { ORIGIN, SITE_NAME } from "@/lib/share";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The fallback for every route. Public pages replace the title, description and
 * card through lib/share.ts; the app screens behind sign in keep this card,
 * which is the right one when somebody pastes a board link into a chat.
 * `metadataBase` turns the share images into absolute URLs, which LinkedIn,
 * WhatsApp and X all require.
 */
export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  applicationName: SITE_NAME,
  title: "GoodSocials",
  description:
    "Hire a social media manager for LinkedIn for $100 instead of $3,000. Publishes for you 5 times a week after your approval.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "GoodSocials: AI social media manager for LinkedIn",
    description:
      "Hire a social media manager for LinkedIn for $100 instead of $3,000. Publishes for you 5 times a week after your approval.",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * Edge to edge on a phone. The page draws under the notch and the home
 * indicator, and globals.css pads the body and the full screen dialogs by the
 * safe area insets so nothing a person has to read or press sits under either.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const openAiAdsPixelId = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {openAiAdsPixelId ? (
          <Script id="openai-ads-pixel" strategy="beforeInteractive">
            {`(function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var js=d.createElement(s);js.async=true;js.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f)})(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"${openAiAdsPixelId}"});`}
          </Script>
        ) : null}
        {children}
        <CrispChat />
      </body>
    </html>
  );
}
