import { cancelPlan, startPlanCheckout, switchPlan } from "@/app/billing/actions";
import { planAction, planOf, type Account } from "@/lib/billing";
import { PLANS, TRIAL_CTA, TRIAL_LINE, type Plan } from "@/lib/plans";

/**
 * A plan card's button for a reader with a session. Every card keeps one, so
 * upgrading, downgrading and cancelling are a click from the prices rather
 * than an email to us. Stripe hosts every page the button opens; which one
 * depends on the account's columns, through `planAction`.
 */
export function PlanButton({
  account,
  plan,
}: {
  account: Account;
  plan: Plan;
}) {
  const action = planAction(account, plan.slug);

  const { run, label, line } = {
    checkout: {
      run: startPlanCheckout.bind(null, plan.slug),
      label: TRIAL_CTA,
      line: TRIAL_LINE,
    },
    switch: {
      run: switchPlan.bind(null, plan.slug),
      label: `Switch to ${plan.name}`,
      line: isUpgrade(planOf(account), plan)
        ? "Starts today, prorated."
        : "Starts at your next renewal.",
    },
    cancel: {
      run: cancelPlan,
      label: "Cancel plan",
      line: "Your plan. Posts run to the end of the period.",
    },
    resume: {
      run: cancelPlan,
      label: "Keep this plan",
      line: "Your plan, set to end.",
    },
  }[action];

  const current = action === "cancel" || action === "resume";

  return (
    <form action={run} className="mt-9">
      <button
        type="submit"
        className={`pill num block w-full px-5 py-[13px] text-center text-[15px] ${
          plan.featured && !current
            ? "btn-paper"
            : "btn-outline border border-hairline bg-surface"
        }`}
      >
        {label}
      </button>
      <p
        className="num mt-3 text-center font-mono text-[12px]"
        style={{
          color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-3)",
        }}
      >
        {line}
      </p>
    </form>
  );
}

/** PLANS runs cheapest first, so a later plan is the dearer one. */
function isUpgrade(from: Plan, to: Plan): boolean {
  return PLANS.indexOf(to) > PLANS.indexOf(from);
}
