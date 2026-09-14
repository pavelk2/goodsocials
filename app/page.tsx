export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-[900px] flex-col justify-center px-6 py-24">
      <h1
        className="max-w-[16ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.98]"
        style={{ letterSpacing: "-0.035em" }}
      >
        <span>AI social media manager for LinkedIn.</span>{" "}
        <span className="text-ink-3">
          Writes high quality content, you approve it in a kanban board, it
          schedules so you post regularly, close to daily.
        </span>
      </h1>

      <ul className="mt-16 max-w-[560px]">
        <li className="flex justify-between border-b border-hairline py-[14px]">
          <span>One LinkedIn profile</span>
          <span className="num text-ink-2">100 USD a month</span>
        </li>
        <li className="flex justify-between border-b border-hairline py-[14px]">
          <span>Up to 12 profiles, for agencies</span>
          <span className="num text-ink-2">1000 USD a month</span>
        </li>
      </ul>

      <p className="mt-16 max-w-[60ch] text-ink-2">
        Opening soon. Built by Pavel in Amsterdam.
      </p>
    </main>
  );
}
