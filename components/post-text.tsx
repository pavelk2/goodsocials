import { boldParts } from "@/lib/bold";

/** Post text with its **labels** drawn bold, the way the feed will show them. */
export function PostText({ text }: { text: string }) {
  return (
    <>
      {boldParts(text).map((part, i) =>
        part.bold ? (
          <strong key={i} className="font-semibold">
            {part.text}
          </strong>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
