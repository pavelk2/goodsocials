import type { Metadata } from "next";
import {
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
} from "@/components/marketing/content";
import { plain } from "@/lib/content/types";
import { COMPARISONS } from "@/lib/content/compare";

export const metadata: Metadata = {
  title: "GoodSocials compared | GoodSocials",
  description:
    "GoodSocials next to 20 other social media and LinkedIn tools: who each one is for, how the workflow differs, and when to pick the other one.",
};

export default function CompareIndex() {
  return (
    <ContentPage>
      <PageTitle
        eyebrow="Compare"
        title="GoodSocials next to twenty social media tools."
        summary="Each page states who the tool suits, where the workflow differs, and when the other tool is the better choice."
      />
      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <LinkRows
          rows={COMPARISONS.map((c) => ({
            href: `/compare/${c.slug}`,
            title: `GoodSocials vs ${c.name}`,
            line: plain(c.category),
          }))}
        />
      </div>
      <CloseBand title="Seven posts on a board, written from one website." />
    </ContentPage>
  );
}
