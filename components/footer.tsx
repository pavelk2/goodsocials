import Link from "next/link";

/** Signed by a person, with the legal pages one click away on every screen. */
export function Footer() {
  return (
    <footer className="mx-auto max-w-[900px] border-t border-hairline px-6 py-10 text-[13px] text-ink-2">
      <p>
        GoodSocials is built and run by Pavel Kucherbaev in Amsterdam. Questions
        go to{" "}
        <a className="underline" href="mailto:pavel@goodsocials.co">
          pavel@goodsocials.co
        </a>
        .
      </p>
      <p className="mt-3 flex gap-4">
        <Link className="underline" href="/privacy">
          Privacy
        </Link>
        <Link className="underline" href="/terms">
          Terms
        </Link>
      </p>
    </footer>
  );
}
