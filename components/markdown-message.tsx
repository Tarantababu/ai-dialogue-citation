"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cleanDialogueText } from "@/lib/dialogue-clean";

/**
 * Convert the LaTeX delimiters AI assistants emit (\( … \) inline and
 * \[ … \] display) into the $ / $$ delimiters that remark-math understands,
 * so equations render instead of showing as raw backslash-bracket text.
 */
function normalizeMath(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, body) => `\n\n$$${body}$$\n\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, body) => `$${body}$`);
}

/**
 * Renders a single dialogue turn's text as GitHub-flavoured Markdown with
 * KaTeX math. Links are forced to open safely in a new tab. Styling is scoped
 * to the `.markdown-body` class in globals.css.
 */
export const MarkdownMessage = memo(function MarkdownMessage({
  text,
}: {
  text: string;
}) {
  const source = normalizeMath(cleanDialogueText(text));
  return (
    <div className="markdown-body text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
});
