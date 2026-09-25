import type { Metadata } from "next";
import { shareMetadata } from "@/lib/share";
import {
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
} from "@/components/marketing/content";
import { COMPARISONS } from "@/lib/content/compare";

export const metadata: Metadata = shareMetadata({
  path: "/compare",
  title: "GoodSocials compared | GoodSocials",
  description:
    "GoodSocials next to 20 other social media and LinkedIn tools: who each one is for, how the workflow differs, and when to pick the other one.",
});

export default function CompareIndex() {
  return (
    <ContentPage>
      <PageTitle
        eyebrow="Compare"
        title="GoodSocials next to the tools you already know."
        summary="Twenty side by sides, with the cases where the other tool is the better pick."
      />
      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <LinkRows
          rows={COMPARISONS.map((c) => ({
            href: `/compare/${c.slug}`,
            title: `GoodSocials vs ${c.name}`,
            line: c.category,
          }))}
        />
      </div>
      <CloseBand title="See what it writes for you." />
    </ContentPage>
  );
}
