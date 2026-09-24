import { Logo } from "@/components/marketing/logo";

/**
 * The funnel's only chrome: the mark, and how far along the member is. No
 * navigation, because every link out of a funnel is a way to leave it.
 */
export function FunnelHeader({ label }: { label?: string | null }) {
  return (
    <header className="mx-auto flex w-full max-w-[1080px] items-center justify-between px-6 pt-6">
      <span className="flex items-center gap-2 font-semibold tracking-[-0.01em]">
        <Logo size={24} />
        GoodSocials
      </span>
      {label ? <span className="num text-[13px] text-ink-2">{label}</span> : null}
    </header>
  );
}
