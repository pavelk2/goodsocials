import { Section, Row } from "@/components/legal";
import { OPERATOR, CONTACT } from "@/lib/legal";

/**
 * The privacy policy itself, with no chrome around it.
 *
 * Split out for the reason SettingsBody is: the same words render on /privacy
 * for a LinkedIn reviewer or a Stripe checkout link, and in a sheet over the
 * landing page for somebody who clicked the footer and should not lose their
 * place. One copy, so the two can never disagree.
 */
export function PrivacyBody() {
  return (
    <>
      <Section title="Who runs this">
        <p>
          {OPERATOR}. We are the data controller for everything described on
          this page. Write to {CONTACT} for anything here.
        </p>
        <p>
          GoodSocials writes LinkedIn posts, shows them to you on a board, and
          publishes the ones you approve at the time you scheduled. That is the
          whole product, and it sets the limit of what we collect.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="mt-2">
          <Row
            label="LinkedIn identity"
            value="Your LinkedIn member id, name, profile picture URL, and email address, received when you sign in with LinkedIn"
          />
          <Row
            label="LinkedIn access token"
            value="Encrypted at rest with AES-256-GCM, used only to publish posts you approved"
          />
          <Row
            label="Content"
            value="Ideas, drafts, generated images, your comments, your brand principles, scheduled times, and the id of each published post"
          />
          <Row
            label="Billing"
            value="Stripe customer id, plan, and subscription status. Card details go to Stripe and never reach our servers"
          />
          <Row
            label="Product usage"
            value="Pages viewed and actions taken, through PostHog, plus generation cost per account"
          />
          <Row
            label="Email"
            value="Receipts, and the warning we send before your LinkedIn connection expires"
          />
        </ul>
        <p className="pt-2">
          We do not ask for a date of birth, a phone number, a home address, or
          anything about people other than you.
        </p>
      </Section>

      <Section title="What we do with each LinkedIn permission">
        <p>
          You grant four scopes in one consent screen. Each one has a single
          use.
        </p>
        <ul className="mt-2">
          <Row label="openid" value="Signs you in. No password to store" />
          <Row
            label="profile"
            value="Shows your name and picture in the app so you can tell which board belongs to which profile"
          />
          <Row
            label="email"
            value="Receipts and the re-authorization warning before the connection dies"
          />
          <Row
            label="w_member_social"
            value="Publishes a post you approved to your own feed, once, at the time on the card"
          />
        </ul>
        <p className="pt-2">
          What we never do with that access: read your feed, your connections,
          your messages, or other members&apos; posts. Post anything you have
          not approved on a specific card. Like, comment, follow, or send
          invitations. Post to a company page. Sell or hand your content to
          anyone outside the processors listed below.
        </p>
        <p>
          A LinkedIn access token lasts 60 days. When it expires, scheduled
          posts stop and we email you to reconnect. We cannot renew it without
          you.
        </p>
      </Section>

      <Section title="Who else touches it">
        <p>
          These processors receive the minimum they need to do their job. No one
          else gets your data, and we sell it to nobody.
        </p>
        <ul className="mt-2">
          <Row
            label="Vercel"
            value="Hosting and the cron that publishes posts"
          />
          <Row
            label="Neon"
            value="Postgres database holding your account and board"
          />
          <Row
            label="LinkedIn"
            value="Sign-in, and publishing the posts you approve"
          />
          <Row
            label="Anthropic"
            value="Generates and revises post text from your brand principles and comments. Anthropic does not train models on this input"
          />
          <Row
            label="OpenRouter"
            value="Routes the image prompt for a card to the image model that draws it"
          />
          <Row label="Stripe" value="Payments and subscriptions" />
          <Row label="Loops" value="Receipts and expiry warnings" />
          <Row label="PostHog" value="Product analytics" />
          <Row
            label="Crisp"
            value="The support chat in the corner, and the messages you send in it"
          />
        </ul>
        <p className="pt-2">
          We also disclose data if the law requires it, and to a buyer if the
          business is ever sold, in which case this page is updated first.
        </p>
      </Section>

      <Section title="Where it lives and how long we keep it">
        <ul className="mt-2">
          <Row
            label="Your account and board"
            value="Kept while your account is open, deleted 30 days after you cancel"
          />
          <Row
            label="LinkedIn access token"
            value="Deleted the moment you disconnect the profile or close the account"
          />
          <Row
            label="Generated images"
            value="Held until the post publishes, then deleted within 30 days"
          />
          <Row
            label="Invoices"
            value="Kept 7 years, because Dutch tax law requires it"
          />
          <Row
            label="Analytics"
            value="Kept 12 months, tied to an account id rather than to your name"
          />
        </ul>
        <p className="pt-2">
          Data is stored in the European Union. Some processors above operate in
          the United States under standard contractual clauses.
        </p>
      </Section>

      <Section title="Deleting your data">
        <p>
          Two buttons, both in settings. Disconnect a profile removes the
          LinkedIn token and stops every scheduled post for it. Delete account
          removes the account, every board, every card, every image, and the
          tokens, within 30 days, invoices excepted. It also cancels your
          subscription that day and removes your saved card from Stripe.
        </p>
        <p>
          Download your data, in the same place, gives you everything stored
          about your account as one JSON file: every profile, board, card,
          comment, principle, theme and scheduled post. Access tokens and
          integration keys are left out, because a file on your laptop is not
          where they should be.
        </p>
        <p>
          You can also revoke our access from LinkedIn: Settings, Data privacy,
          Other applications, Permitted services. Revoking there stops
          publishing immediately. It does not delete what is stored here, so
          email {CONTACT} if you want that too, and we answer within 30 days.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under the GDPR you can ask for a copy of your data, correct it, take
          it elsewhere, have it deleted, or object to how we use it. The copy
          and the deletion are buttons in settings. For the rest, email{" "}
          {CONTACT} and we reply within 30 days, at no cost.
        </p>
        <p>
          Our legal bases: performing the contract you signed up for, for the
          account, board, publishing, and billing. Your consent, for the
          LinkedIn permissions, withdrawable at any time as described above.
          Legitimate interest, for analytics, fraud prevention, and keeping the
          service running.
        </p>
        <p>
          If we handle a request badly you can complain to the Dutch data
          protection authority, Autoriteit Persoonsgegevens, at
          autoriteitpersoonsgegevens.nl.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          One cookie keeps you signed in. PostHog sets an analytics cookie so we
          can count how a feature is used. Crisp sets one so the support chat
          remembers your conversation between visits. No advertising cookies, no
          third-party trackers, no data sold to brokers.
        </p>
      </Section>

      <Section title="Security">
        <p>
          LinkedIn tokens are encrypted at rest with AES-256-GCM and a key held
          outside the database. Tokens are never logged and never sent to the
          browser. Everything runs over HTTPS. If a breach affects you, we tell
          you and the regulator within 72 hours of finding it.
        </p>
      </Section>

      <Section title="Children">
        <p>
          GoodSocials is for people running a LinkedIn profile for work. It is
          not intended for anyone under 18, and we do not knowingly collect
          their data.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          When this page changes, the date at the top changes with it. If a
          change affects what we collect or who receives it, we email you before
          it takes effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>{CONTACT}. A person reads it.</p>
      </Section>
    </>
  );
}
