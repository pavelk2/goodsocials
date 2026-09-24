"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SaveResult } from "@/app/settings/actions";
import { Working } from "@/components/ui/working";

/**
 * A settings row whose value is the control. Label left, native select right,
 * saved on change. No Edit, no Save, no Cancel: three clicks for a choice out
 * of three is three clicks too many, and a select is the thing every platform
 * already knows how to open with a keyboard.
 *
 * The row says "Saving" while the write is in flight and goes quiet again when
 * it lands, which is the whole feedback. A failure says what happened in the
 * row rather than in a toast that leaves.
 */
export function ChoiceRow({
  label,
  value,
  options,
  save,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  save: (value: string) => Promise<SaveResult>;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const result = await save(next);
      if (result.ok) {
        router.refresh();
      } else {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <li className="border-b border-hairline py-[14px]">
      <div className="flex items-baseline justify-between gap-6">
        <label
          className="text-[13px] font-medium text-ink-2"
          htmlFor={`setting-${label}`}
        >
          {label}
        </label>
        <span className="flex items-baseline gap-3">
          {pending ? (
            <Working label="Saving" className="text-[13px]" />
          ) : null}
          <select
            id={`setting-${label}`}
            value={current}
            disabled={pending}
            onChange={(e) => change(e.target.value)}
            className="cursor-pointer rounded-[8px] border border-hairline bg-surface px-3 py-1 text-right text-[15px] text-ink outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </div>
      {error ? (
        <p className="mt-2 text-right text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
