import type { NextRequest } from "next/server";
import { decode } from "turbo-stream";

/**
 * TEMPORARY diagnostic — reports what THIS server receives when fetching a
 * share URL, to distinguish "format changed" from "datacenter IP blocked".
 * Restricted to ChatGPT/Claude share URLs. Remove after diagnosis.
 */
const SHARE_RE =
  /^https:\/\/(?:chat\.openai\.com|chatgpt\.com|claude\.ai)\/share\/[A-Za-z0-9-]+\/?$/i;

export async function GET(req: NextRequest): Promise<Response> {
  const u = req.nextUrl.searchParams.get("u") ?? "";
  if (!SHARE_RE.test(u)) {
    return Response.json({ error: "bad url" }, { status: 400 });
  }

  const ua =
    req.nextUrl.searchParams.get("ua") === "chrome"
      ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
      : "Mozilla/5.0 (compatible; SifirDususBot/1.0)";

  try {
    const res = await fetch(u, {
      headers: { "User-Agent": ua, Accept: "text/html,application/xhtml+xml" },
      cache: "no-store",
    });
    const html = await res.text();

    const re = /streamController\.enqueue\("((?:[^"\\]|\\.)*)"\)/g;
    const chunks: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      try {
        chunks.push(JSON.parse(`"${m[1]}"`) as string);
      } catch {}
    }

    let messageCount = 0;
    let decodeOk = false;
    if (chunks.length > 0) {
      try {
        const stream = new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(new TextEncoder().encode(chunks.join("")));
            c.close();
          },
        });
        const root = ((await decode(stream)) as { value: unknown }).value;
        decodeOk = true;
        let n = 0;
        const walk = (node: unknown, d: number): void => {
          if (d > 60 || !node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            node.forEach((x) => walk(x, d + 1));
            return;
          }
          const o = node as Record<string, unknown>;
          const a = o.author as Record<string, unknown> | undefined;
          const c = o.content as Record<string, unknown> | undefined;
          if (a && typeof a.role === "string" && c && Array.isArray(c.parts)) n++;
          Object.values(o).forEach((v) => walk(v, d + 1));
        };
        walk(root, 0);
        messageCount = n;
      } catch {}
    }

    return Response.json({
      httpStatus: res.status,
      contentType: res.headers.get("content-type"),
      bytes: html.length,
      cfRay: res.headers.get("cf-ray"),
      hasEnqueue: html.includes("streamController.enqueue"),
      chunkCount: chunks.length,
      decodeOk,
      messageCount,
      titleSnippet: (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").slice(0, 80),
      bodySnippet: html.slice(0, 220),
    });
  } catch (err) {
    return Response.json({
      error: err instanceof Error ? err.message : "fetch failed",
    });
  }
}
