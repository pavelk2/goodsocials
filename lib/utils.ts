/**
 * Class names joined, falsy ones dropped. The Kobra components import this by
 * name. No tailwind-merge behind it: nothing here passes a class meant to
 * override one the component already sets.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
