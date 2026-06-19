/**
 * Strip the inline tool/structured-content markers that ChatGPT (and similar)
 * embed in assistant messages. These are delimited by Unicode Private-Use-Area
 * characters (U+E200 start, U+E202 separator, U+E201 end) wrapping a type token
 * and a JSON/array payload wrapping a type token
 * render as tofu boxes and leak raw JSON into the transcript.
 *
 * Pure and isomorphic: used by the server parser (so future seals store clean
 * text) and by the reader view (so already-sealed dialogues display cleanly).
 */
export function cleanDialogueText(text: string): string {
  if (!text) return text;
  return (
    text
      // Whole structured blocks: U+E200 <type> U+E202 <payload> U+E201
      .replace(/\uE200[\s\S]*?\uE201/g, "")
      // Any stray Private-Use-Area markers / unclosed delimiters left behind.
      .replace(/[\uE000-\uF8FF]/g, "")
      // Tidy whitespace introduced by removed inline blocks.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Human label for a platform + optional model, e.g. "ChatGPT · gpt-5-3-mini". */
export function aiModelLabel(
  platform: string | null,
  model: string | null,
): string {
  const p = platform && platform !== "Manual" ? platform : null;
  if (p && model) return `${p} · ${model}`;
  if (p) return p;
  if (model) return model;
  return "—";
}
