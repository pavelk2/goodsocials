import type { Metadata } from "next";
import {
  Blocks,
  CloseBand,
  ContentPage,
  PageTitle,
} from "@/components/marketing/content";
import { JsonLd } from "@/components/marketing/json-ld";
import { TextFormatter } from "@/components/marketing/text-formatter";
import type { Block } from "@/lib/content/types";
import { ORIGIN, SITE_NAME, shareMetadata } from "@/lib/share";
import { breadcrumbs, jsonLd } from "@/lib/structured-data";

const PATH = "/tools/linkedin-text-formatter";

export const metadata: Metadata = shareMetadata({
  path: PATH,
  title: "LinkedIn text formatter: bold and italic text for posts",
  description:
    "Free LinkedIn text formatter. Make words bold or italic, count characters against the 3,000 limit, and preview where 'see more' cuts your post. Nothing to sign up for.",
});

const BLOCKS: Block[] = [
  { type: "h2", text: "How bold text on LinkedIn works" },
  {
    type: "p",
    text: "LinkedIn posts have no formatting buttons. Bold and italic text in the feed comes from Unicode: separate alphabets of letters that look bold or italic in any font. This tool swaps your letters for those, and you paste the result into LinkedIn like any other text.",
  },
  { type: "h2", text: "When not to use it" },
  {
    type: "list",
    items: [
      "Whole paragraphs. Screen readers read these letters one by one or skip them, so a bold paragraph is a paragraph some readers never hear.",
      "Words people search for. LinkedIn search matches plain letters, so a styled keyword may not be found.",
      "Every post. One bold heading or one stressed word does the job; more reads as shouting.",
    ],
  },
  { type: "h2", text: "Where 'see more' falls" },
  {
    type: "p",
    text: "The feed folds a post after the first few lines, and the exact point depends on the device and on your line breaks. The preview shows three lines at phone width, which is close to what most readers see. If the point of the post is not in those lines, move it up.",
  },
  {
    type: "steps",
    items: [
      "Paste or write your post in the box.",
      "Select a word or a line and press Bold, Italic or Bold italic. Press Plain to undo it.",
      "Check the counter and the preview.",
      "Press Copy post and paste it into LinkedIn.",
    ],
  },
];

export default function LinkedInTextFormatter() {
  return (
    <ContentPage>
      <JsonLd
        data={jsonLd(
          {
            "@type": "WebApplication",
            name: "LinkedIn text formatter",
            url: `${ORIGIN}${PATH}`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@type": "Organization", name: SITE_NAME, url: ORIGIN },
          },
          breadcrumbs([
            { name: SITE_NAME, path: "" },
            { name: "LinkedIn text formatter", path: PATH },
          ]),
        )}
      />
      <PageTitle
        eyebrow="Free tool"
        title="LinkedIn text formatter."
        summary="Bold and italic text for your posts, a character count, and where 'see more' cuts."
      />

      <div className="mx-auto mt-14 w-full max-w-[1080px] px-6">
        <TextFormatter />
      </div>

      <div className="mx-auto mt-20 w-full max-w-[760px] px-6">
        <Blocks blocks={BLOCKS} />
      </div>

      <CloseBand title="Let it write the post as well." />
    </ContentPage>
  );
}
