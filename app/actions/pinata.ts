"use server";

import { PinataSDK } from "pinata-web3";
import type {
  DialogueMessage,
  OriginInputType,
  PinResult,
  SealedPayload,
} from "@/lib/types";

/**
 * ────────────────────────────────────────────────────────────────────────
 *  PHASE 2 — Dual-input ingestion pipeline (Server Actions).
 *
 *  Option A · Share Link  → fetch public HTML, extract dialogue, pin JSON.
 *  Option B · Direct Paste → parse raw text/Markdown, pin JSON.
 *
 *  The PINATA_JWT is read ONLY here, on the server. It is never imported into
 *  a client component and never prefixed with NEXT_PUBLIC_, so it cannot leak
 *  into the browser bundle.
 * ────────────────────────────────────────────────────────────────────────
 */

const SHARE_URL_REGEX =
  /^https:\/\/(?:chat\.openai\.com|chatgpt\.com|claude\.ai)\/share\/[A-Za-z0-9-]+\/?$/i;

const MAX_HTML_BYTES = 8 * 1024 * 1024; // 8 MB safety cap on fetched payloads
const MAX_MESSAGES = 2000;
const MAX_TEXT_CHARS = 1_500_000;
const FETCH_TIMEOUT_MS = 15_000;

interface PlatformInfo {
  platform: "ChatGPT" | "Claude";
}

/** Validate an incoming share URL and identify the platform. */
function classifyShareUrl(url: string): PlatformInfo | null {
  const trimmed = url.trim();
  if (!SHARE_URL_REGEX.test(trimmed)) return null;
  if (/claude\.ai/i.test(trimmed)) return { platform: "Claude" };
  return { platform: "ChatGPT" };
}

/** Decode the small set of HTML entities that survive JSON extraction. */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

interface RankedMessage extends DialogueMessage {
  order: number;
}

/**
 * Deeply walk any parsed JSON tree looking for known message shapes.
 * Supports both ChatGPT (author.role + content.parts) and Claude
 * (sender + text / role + content) embedded payloads. Far more robust than
 * regex against minified, evolving share-page markup.
 */
function collectMessages(node: unknown, sink: RankedMessage[], depth = 0): void {
  if (depth > 40 || sink.length > MAX_MESSAGES) return;

  if (Array.isArray(node)) {
    for (const item of node) collectMessages(item, sink, depth + 1);
    return;
  }
  if (node === null || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;

  // ── ChatGPT shape ──────────────────────────────────────────────
  const author = obj.author as Record<string, unknown> | undefined;
  const content = obj.content as Record<string, unknown> | undefined;
  if (author && typeof author.role === "string" && content) {
    const role = author.role;
    const parts = content.parts;
    if ((role === "user" || role === "assistant") && Array.isArray(parts)) {
      const text = parts
        .filter((p): p is string => typeof p === "string")
        .join("\n")
        .trim();
      if (text) {
        const order =
          typeof obj.create_time === "number"
            ? obj.create_time
            : sink.length;
        sink.push({ role, text, order });
      }
    }
  }

  // ── Claude shape (sender/text) ─────────────────────────────────
  if (typeof obj.sender === "string" && typeof obj.text === "string") {
    const role: DialogueMessage["role"] =
      obj.sender === "human" || obj.sender === "user" ? "user" : "assistant";
    const text = obj.text.trim();
    if (text) {
      const order = typeof obj.index === "number" ? obj.index : sink.length;
      sink.push({ role, text, order });
    }
  }

  // ── Claude shape (role + content blocks) ───────────────────────
  if (
    (obj.role === "human" || obj.role === "user" || obj.role === "assistant") &&
    Array.isArray(obj.content)
  ) {
    const role: DialogueMessage["role"] =
      obj.role === "assistant" ? "assistant" : "user";
    const text = (obj.content as unknown[])
      .map((block) => {
        if (block && typeof block === "object") {
          const b = block as Record<string, unknown>;
          if (typeof b.text === "string") return b.text;
        }
        return "";
      })
      .join("\n")
      .trim();
    if (text) {
      sink.push({ role, text, order: sink.length });
    }
  }

  for (const key of Object.keys(obj)) {
    collectMessages(obj[key], sink, depth + 1);
  }
}

/** Pull and JSON-parse every <script> blob in the document. */
function* iterateScriptJson(html: string): Generator<unknown> {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.length < 2) continue;
    if (raw[0] !== "{" && raw[0] !== "[") continue;
    try {
      yield JSON.parse(decodeEntities(raw));
    } catch {
      // Not valid standalone JSON (e.g. assignment expression) — skip.
    }
  }
}

/**
 * Extract an ordered dialogue stream from a fetched share page.
 * Returns [] when no recognizable structure is present.
 */
function extractDialogueFromHtml(html: string): DialogueMessage[] {
  const collected: RankedMessage[] = [];
  for (const json of iterateScriptJson(html)) {
    collectMessages(json, collected);
    if (collected.length > MAX_MESSAGES) break;
  }

  // De-duplicate (mappings can repeat nodes) while preserving first order.
  const seen = new Set<string>();
  const unique = collected.filter((m) => {
    const key = `${m.role}:${m.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => a.order - b.order);
  return unique.map(({ role, text }) => ({ role, text }));
}

/**
 * Parse pasted raw text / Markdown into a structured stream.
 * Recognizes "User:" / "Assistant:" (and common synonyms) turn markers; when
 * none are present, the entire payload is captured as a single user turn.
 */
function parseDirectText(raw: string): DialogueMessage[] {
  const text = raw.trim();
  if (!text) return [];

  const markerRegex =
    /^\s*(user|you|human|prompt|assistant|ai|chatgpt|claude|gpt|response)\s*[:：]/i;

  const lines = text.split(/\r?\n/);
  const messages: DialogueMessage[] = [];
  let current: DialogueMessage | null = null;

  const roleFor = (label: string): DialogueMessage["role"] =>
    /^(assistant|ai|chatgpt|claude|gpt|response)$/i.test(label)
      ? "assistant"
      : "user";

  let sawMarker = false;
  for (const line of lines) {
    const m = line.match(markerRegex);
    if (m) {
      sawMarker = true;
      if (current && current.text.trim()) messages.push(current);
      const label = m[1];
      const rest = line.slice(m[0].length).trim();
      current = { role: roleFor(label), text: rest };
    } else if (current) {
      current.text += (current.text ? "\n" : "") + line;
    } else {
      current = { role: "user", text: line };
    }
  }
  if (current && current.text.trim()) messages.push(current);

  if (!sawMarker) {
    return [{ role: "user", text }];
  }
  return messages
    .map((m) => ({ role: m.role, text: m.text.trim() }))
    .filter((m) => m.text.length > 0);
}

/** Fetch the public share HTML with a timeout and a size guard. */
async function fetchShareHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SifirDususBot/1.0; +https://sifirdusus.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Share page returned HTTP ${res.status}.`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      throw new Error("Share page payload exceeds the safe size limit.");
    }
    return new TextDecoder("utf-8").decode(buf);
  } finally {
    clearTimeout(timer);
  }
}

/** Instantiate the Pinata SDK lazily so missing env fails loudly at call time. */
function getPinata(): PinataSDK {
  const jwt = process.env.PINATA_JWT;
  if (!jwt || jwt === "YOUR_PINATA_JWT") {
    throw new Error(
      "PINATA_JWT is not configured on the server. Set it in .env.local.",
    );
  }
  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  });
}

/** Pin a sealed payload to IPFS and return the CID + metadata. */
async function pinPayload(
  payload: SealedPayload,
  name: string,
): Promise<{ cid: string; size: number }> {
  const pinata = getPinata();
  const upload = await pinata.upload.json(payload, {
    metadata: { name },
  });
  return { cid: upload.IpfsHash, size: upload.PinSize };
}

function buildPayload(
  messages: DialogueMessage[],
  origin: OriginInputType,
  platform: string,
  sourceUrl: string | null,
  sourceRef: string,
  authorName: string | null,
): SealedPayload {
  return {
    schema: "decite/dialogue@1",
    origin,
    authorName: authorName?.trim() || null,
    sourceRef: sourceRef.trim(),
    sourceUrl,
    platform,
    messages,
    capturedAt: new Date().toISOString(),
  };
}

// ─── Exported Server Actions ───────────────────────────────────────────────

/**
 * Option A — seal an official AI share link.
 * Validates the URL, fetches and parses the dialogue, then pins to IPFS.
 */
export async function sealFromShareLink(
  rawUrl: string,
  sourceRef: string,
  authorName: string | null = null,
): Promise<PinResult> {
  try {
    const info = classifyShareUrl(rawUrl);
    if (!info) {
      return {
        ok: false,
        error:
          "Invalid share URL. Provide an official chatgpt.com/share/… or claude.ai/share/… link.",
      };
    }

    const html = await fetchShareHtml(rawUrl.trim());
    const messages = extractDialogueFromHtml(html);

    if (messages.length === 0) {
      return {
        ok: false,
        error:
          "Could not extract the dialogue from this share page. The platform may have changed its format — use Direct Text Capture instead.",
      };
    }

    const payload = buildPayload(
      messages,
      "share-link",
      info.platform,
      rawUrl.trim(),
      sourceRef,
      authorName,
    );
    const { cid, size } = await pinPayload(
      payload,
      `sdp-${info.platform.toLowerCase()}-${Date.now()}`,
    );

    return {
      ok: true,
      ipfsCID: cid,
      size,
      platform: info.platform,
      origin: "share-link",
      sourceUrl: rawUrl.trim(),
      messageCount: messages.length,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Unexpected error while sealing the share link.",
    };
  }
}

/**
 * Option B — seal directly pasted text / Markdown.
 * Bypasses scraping entirely and pins the normalized JSON payload.
 */
export async function sealFromDirectText(
  rawText: string,
  sourceRef: string,
  authorName: string | null = null,
): Promise<PinResult> {
  try {
    if (!rawText || !rawText.trim()) {
      return { ok: false, error: "No conversation content was provided." };
    }
    if (rawText.length > MAX_TEXT_CHARS) {
      return { ok: false, error: "Pasted content exceeds the size limit." };
    }

    const messages = parseDirectText(rawText);
    if (messages.length === 0) {
      return { ok: false, error: "No usable dialogue content was found." };
    }

    const payload = buildPayload(
      messages,
      "direct-paste",
      "Manual",
      null,
      sourceRef,
      authorName,
    );
    const { cid, size } = await pinPayload(payload, `sdp-manual-${Date.now()}`);

    return {
      ok: true,
      ipfsCID: cid,
      size,
      platform: "Manual",
      origin: "direct-paste",
      sourceUrl: null,
      messageCount: messages.length,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Unexpected error while sealing the pasted text.",
    };
  }
}
