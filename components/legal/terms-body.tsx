import { Section, Row } from "@/components/legal";
import {
  OPERATOR,
  CONTACT,
  AGENCY_SEATS,
  IMAGE_CAP_PER_MONTH,
} from "@/lib/legal";
import {
  PRICE_SOLO,
  PRICE_AGENCY,
  PRICE_CONSULTANCY,
  TRIAL_DAYS,
} from "@/lib/plans";

/**
 * The terms of use itself, with no chrome around it.
 *
 * Split out for the reason SettingsBody is: the same words render on
 * /terms for a LinkedIn reviewer or a Stripe checkout link, and in a sheet
 * over the landing page for somebody who clicked the footer and should not
 * lose their place. One copy, so the two can never disagree.
 */
export function TermsBody() {
  return (
    <>
      <Section title="The agreement">
        <p>
          These terms are between you and {OPERATOR}. Using GoodSocials means
          you accept them. If you are signing up for a company, you confirm you
          can bind that company.
        </p>
      </Section>

      <Section title="What the service does">
        <p>
          GoodSocials generates LinkedIn post ideas and drafts for a profile you
          control, puts them on a board, and publishes the ones you approve at
          the time on the card. Nothing reaches your feed without your approval
          on that specific card.
        </p>
        <p>
          A comment on a card rewrites the card and updates your brand
          principles, so the correction carries to later cards.
        </p>
      </Section>

      <Section title="Plans and price">
        <ul className="mt-2">
          <Row label="One LinkedIn profile" value={PRICE_SOLO} />
          <Row
            label={`Up to ${AGENCY_SEATS} profiles, for agencies`}
            value={PRICE_AGENCY}
          />
          <Row
            label={`Up to ${AGENCY_SEATS} profiles, and a call with the founder every week`}
            value={PRICE_CONSULTANCY}
          />
          <Row
            label="Generated images"
            value={`${IMAGE_CAP_PER_MONTH} per profile per calendar month, regenerations included`}
          />
        </ul>
        <p className="pt-2">
          Every plan starts with {TRIAL_DAYS} days free. We take no payment in
          those days, and the first charge lands on day {TRIAL_DAYS + 1} unless
          you cancel before then. Prices are in US dollars and exclude VAT where
          it applies. Billing runs monthly through Stripe, in advance, and
          renews until you cancel. At the image cap, generation stops for that
          profile until the month turns over, and you keep posting text.
        </p>
      </Section>

      <Section title="Cancelling and refunds">
        <p>
          Cancel in settings at any time. The subscription runs to the end of
          the period you paid for, then stops. We do not refund a part-used
          month. If the service was broken and we failed to fix it, email{" "}
          {CONTACT} and we will sort it out.
        </p>
      </Section>

      <Section title="Your LinkedIn account">
        <p>
          You need a LinkedIn account in good standing, and you have to connect
          it yourself. You may only connect a profile you are authorized to post
          as. On the agency plan, get each person&apos;s permission before
          connecting them, since every post publishes under their name.
        </p>
        <p>
          Your use of LinkedIn stays governed by LinkedIn&apos;s own user
          agreement. LinkedIn can change its API, its limits, or your access
          without telling us first. If that breaks publishing, we fix what we
          can and tell you what we cannot.
        </p>
        <p>
          Access tokens from LinkedIn last 60 days. We warn you by email before
          one expires. If you do not reconnect, scheduled posts stop publishing,
          and that is not a service failure we can refund.
        </p>
      </Section>

      <Section title="What you are responsible for">
        <p>
          Every post is written by a model and published under your name, so you
          check it before approving. You own what goes out and you are
          accountable for it: the claims in it, the rights to any material you
          add, and whether it fits your professional obligations.
        </p>
        <p>Do not use GoodSocials to publish:</p>
        <ul className="mt-2">
          <Row
            label="Anything unlawful"
            value="Including content that infringes copyright, defames someone, or breaks a confidentiality or securities rule"
          />
          <Row
            label="Harassment or hate"
            value="Content targeting a person or a group, or anything LinkedIn's own policies prohibit"
          />
          <Row
            label="Spam"
            value="Bulk identical posts, engagement farming, or automated posting from accounts you do not control"
          />
          <Row
            label="Impersonation"
            value="Posting as a person or a company without their permission"
          />
        </ul>
        <p className="pt-2">
          Do not attempt to break the service, work around the image cap or the
          seat limit, resell access, or extract our prompts to build a
          competitor.
        </p>
      </Section>

      <Section title="Who owns what">
        <p>
          You own your posts, your drafts, your images, and your brand
          principles. We hold them only to run the service for you, and we
          delete them as described in the privacy policy.
        </p>
        <p>
          We own the software, the prompts, and the design. Nothing here
          transfers that to you.
        </p>
        <p>
          Generated text and images come from models that other customers also
          use, so we cannot promise any output is unique or that it is
          copyrightable where you live.
        </p>
      </Section>

      <Section title="Uptime and limits of liability">
        <p>
          We run on Vercel, Neon, LinkedIn, Anthropic, OpenRouter, and Stripe.
          Any one of them can go down and take a scheduled post with it. We
          watch failed publishes, retry them, and show you the error rather than
          hiding it, but we do not promise a specific uptime figure.
        </p>
        <p>
          The service is provided as it is. To the extent the law allows, our
          total liability for any claim is capped at what you paid us in the 12
          months before it arose, and we are not liable for lost profit, lost
          followers, lost business, or reputational harm from a post you
          approved.
        </p>
      </Section>

      <Section title="Suspending or closing an account">
        <p>
          We can suspend an account that breaks these terms, harms other
          customers, or puts our LinkedIn app at risk, and we tell you why. For
          anything short of clear abuse you get a chance to fix it first. You
          can close your account whenever you want, and we delete your data as
          the privacy policy sets out.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          When these terms change, the date at the top changes with them. For a
          material change we email you at least 30 days before it takes effect,
          and you can cancel before it does.
        </p>
      </Section>

      <Section title="Law">
        <p>
          Dutch law governs this agreement, and the courts of Amsterdam have
          jurisdiction. If you are a consumer, the mandatory protections of your
          home country still apply.
        </p>
      </Section>

      <Section title="Contact">
        <p>{CONTACT}. A person reads it.</p>
      </Section>
    </>
  );
}
