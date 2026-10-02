// Minimal, safe Markdown renderer for admin-edited pages: headings, paragraphs,
// blockquotes, lists and **bold**. Output is React elements — never raw HTML.
import { Fragment } from "react";

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="prose-ec">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (block.startsWith("## ")) {
          const [h, ...rest] = lines;
          return (
            <Fragment key={i}>
              <h2>{h.slice(3)}</h2>
              {rest.length > 0 && <p>{inline(rest.join(" "))}</p>}
            </Fragment>
          );
        }
        if (block.startsWith("> ")) return <blockquote key={i}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}</blockquote>;
        if (lines.every((l) => /^[-*] /.test(l)))
          return (
            <ul key={i} className="my-3 list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
